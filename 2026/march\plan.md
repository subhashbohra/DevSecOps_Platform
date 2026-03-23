# Ollama on GKE — Complete Installation & Setup Guide
## Enterprise-Grade Private LLM Deployment

**Environment:** GKE (mirrors GDC deployment exactly)
**Goal:** Run Gemma 2 / Llama 3.1 as an internal ClusterIP service — no external traffic
**Prerequisites:** `kubectl`, `helm`, `gcloud` CLI installed and configured

---

## PART 1 — PREREQUISITES & CLUSTER SETUP

### Step 1.1 — Verify your GKE cluster

```bash
# Check cluster is running and you have access
kubectl cluster-info
kubectl get nodes

# Check available node resources (you need to know CPU/RAM/GPU availability)
kubectl describe nodes | grep -A 10 "Allocatable:"

# Check current namespaces
kubectl get namespaces
```

### Step 1.2 — Choose your deployment mode

Decide based on what hardware your cluster has:

| Mode | Hardware | Model options | Response time | Best for |
|------|----------|---------------|---------------|---------|
| GPU (recommended) | NVIDIA GPU node | Gemma 2 9B, Llama 3.1 8B | 2–5 sec | Production PoC |
| CPU only | Any node, 8+ GB RAM | Gemma 2 2B, Phi-3 mini | 15–45 sec | No GPU available |
| CPU + quantized | Any node, 6+ GB RAM | Gemma 2 2B Q4 | 10–30 sec | Budget PoC |

**For enterprise GDC without GPU:** CPU mode with Gemma 2 2B works fine for async callbacks.
**For personal GCP PoC with GPU:** Add a single T4 GPU node pool (spot instance = ~$0.35/hr).

---

## PART 2 — NAMESPACE & RBAC SETUP

### Step 2.1 — Create dedicated namespace

```bash
kubectl create namespace llm-serving

# Label it for network policy and monitoring
kubectl label namespace llm-serving \
  purpose=ai-inference \
  environment=poc \
  team=data-engineering
```

### Step 2.2 — Create service account

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ollama-sa
  namespace: llm-serving
  labels:
    app: ollama
EOF
```

### Step 2.3 — Create RBAC (least privilege)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ollama-role
  namespace: llm-serving
rules:
  - apiGroups: [""]
    resources: ["pods", "services", "endpoints"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ollama-rolebinding
  namespace: llm-serving
subjects:
  - kind: ServiceAccount
    name: ollama-sa
    namespace: llm-serving
roleRef:
  kind: Role
  name: ollama-role
  apiGroup: rbac.authorization.k8s.io
EOF
```

---

## PART 3 — STORAGE SETUP

Ollama needs persistent storage to hold model weights (~5–10 GB per model).
You do NOT want models re-downloaded every pod restart.

### Step 3.1 — Create PersistentVolumeClaim

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ollama-models-pvc
  namespace: llm-serving
  labels:
    app: ollama
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard-rwo   # Use your cluster's storage class
  resources:
    requests:
      storage: 50Gi               # 50GB covers 3-4 models comfortably
EOF
```

```bash
# Verify storage class available in your cluster
kubectl get storageclass

# For GKE standard clusters, common classes are:
#   standard-rwo   (balanced persistent disk, ReadWriteOnce)
#   premium-rwo    (SSD persistent disk, ReadWriteOnce)
#   standard       (legacy, avoid for new deployments)

# Wait for PVC to be bound
kubectl get pvc -n llm-serving --watch
# Should show STATUS: Bound within 30 seconds
```

---

## PART 4A — CPU-ONLY DEPLOYMENT (no GPU)

Use this if your cluster has no GPU nodes.

### Step 4A.1 — Create the Deployment (CPU mode)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: llm-serving
  labels:
    app: ollama
    version: "0.3"
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      serviceAccountName: ollama-sa
      containers:
        - name: ollama
          image: ollama/ollama:latest
          ports:
            - name: http
              containerPort: 11434
              protocol: TCP
          env:
            - name: OLLAMA_HOST
              value: "0.0.0.0"
            - name: OLLAMA_NUM_PARALLEL
              value: "2"            # Max concurrent requests
            - name: OLLAMA_MAX_LOADED_MODELS
              value: "1"            # Keep 1 model in memory
            - name: OLLAMA_KEEP_ALIVE
              value: "10m"          # Keep model loaded for 10 minutes
          resources:
            requests:
              memory: "6Gi"
              cpu: "2000m"
            limits:
              memory: "10Gi"
              cpu: "4000m"
          volumeMounts:
            - name: ollama-data
              mountPath: /root/.ollama
          readinessProbe:
            httpGet:
              path: /api/tags
              port: 11434
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /api/tags
              port: 11434
            initialDelaySeconds: 60
            periodSeconds: 30
            failureThreshold: 5
      volumes:
        - name: ollama-data
          persistentVolumeClaim:
            claimName: ollama-models-pvc
      # Ensure pod restarts don't lose the model
      terminationGracePeriodSeconds: 60
EOF
```

---

## PART 4B — GPU DEPLOYMENT (recommended for speed)

### Step 4B.1 — Add GPU node pool (personal GCP project only)

```bash
# Add a single T4 GPU node pool with autoscaling (0-1 nodes = cost efficient)
gcloud container node-pools create gpu-pool \
  --cluster=YOUR_CLUSTER_NAME \
  --zone=YOUR_ZONE \
  --machine-type=n1-standard-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --num-nodes=1 \
  --min-nodes=0 \
  --max-nodes=1 \
  --enable-autoscaling \
  --spot \                          # Spot = ~70% cheaper, fine for PoC
  --node-labels=accelerator=nvidia-t4

# Install NVIDIA GPU drivers via DaemonSet
kubectl apply -f https://raw.githubusercontent.com/GoogleCloudPlatform/container-engine-accelerators/master/nvidia-driver-installer/cos/daemonset-preloaded.yaml

# Verify GPU is visible to the cluster
kubectl get nodes -l accelerator=nvidia-t4
kubectl describe node <gpu-node-name> | grep -A5 "nvidia.com/gpu"
```

### Step 4B.2 — Create the Deployment (GPU mode)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: llm-serving
  labels:
    app: ollama
    version: "0.3"
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      serviceAccountName: ollama-sa
      nodeSelector:
        accelerator: nvidia-t4      # Schedule on GPU node
      tolerations:
        - key: "nvidia.com/gpu"
          operator: "Exists"
          effect: "NoSchedule"
      containers:
        - name: ollama
          image: ollama/ollama:latest
          ports:
            - name: http
              containerPort: 11434
              protocol: TCP
          env:
            - name: OLLAMA_HOST
              value: "0.0.0.0"
            - name: OLLAMA_NUM_PARALLEL
              value: "4"
            - name: OLLAMA_MAX_LOADED_MODELS
              value: "2"
            - name: OLLAMA_KEEP_ALIVE
              value: "30m"
            - name: CUDA_VISIBLE_DEVICES
              value: "0"
          resources:
            requests:
              memory: "8Gi"
              cpu: "2000m"
              nvidia.com/gpu: "1"
            limits:
              memory: "16Gi"
              cpu: "4000m"
              nvidia.com/gpu: "1"
          volumeMounts:
            - name: ollama-data
              mountPath: /root/.ollama
          readinessProbe:
            httpGet:
              path: /api/tags
              port: 11434
            initialDelaySeconds: 30
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /api/tags
              port: 11434
            initialDelaySeconds: 60
            periodSeconds: 30
      volumes:
        - name: ollama-data
          persistentVolumeClaim:
            claimName: ollama-models-pvc
      terminationGracePeriodSeconds: 60
EOF
```

---

## PART 5 — CREATE THE SERVICE

This is the internal endpoint your Airflow DAGs will call.
**ClusterIP = accessible only within the cluster. Nothing external.**

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: ollama-service
  namespace: llm-serving
  labels:
    app: ollama
spec:
  type: ClusterIP          # CRITICAL: internal only, never LoadBalancer
  selector:
    app: ollama
  ports:
    - name: http
      protocol: TCP
      port: 11434
      targetPort: 11434
EOF
```

```bash
# Verify service is created
kubectl get svc -n llm-serving

# Your Airflow DAGs will use this internal DNS URL:
# http://ollama-service.llm-serving.svc.cluster.local:11434
```

---

## PART 6 — VERIFY DEPLOYMENT

```bash
# Watch pod come up
kubectl get pods -n llm-serving --watch

# Once Running, check logs
kubectl logs -f deployment/ollama -n llm-serving

# Expected log output:
# time=... level=INFO msg="inference compute" id=... library=cpu ...
# time=... level=INFO msg="server listening" address=0.0.0.0:11434

# Check pod is healthy
kubectl describe pod -l app=ollama -n llm-serving
```

---

## PART 7 — PULL MODELS INTO THE CLUSTER

**Important:** This step downloads model weights INTO the PVC.
After this, the pod never needs internet access again.

### Step 7.1 — Exec into the pod and pull models

```bash
# Get pod name
export OLLAMA_POD=$(kubectl get pods -n llm-serving -l app=ollama -o jsonpath='{.items[0].metadata.name}')
echo "Pod: $OLLAMA_POD"

# Pull Gemma 2 2B (CPU friendly, ~1.6 GB, good for PoC)
kubectl exec -n llm-serving $OLLAMA_POD -- ollama pull gemma2:2b

# Pull Gemma 2 9B (better quality, ~5.5 GB, needs 8GB+ RAM or GPU)
kubectl exec -n llm-serving $OLLAMA_POD -- ollama pull gemma2:9b

# Pull Llama 3.1 8B (excellent JSON output, ~4.7 GB)
kubectl exec -n llm-serving $OLLAMA_POD -- ollama pull llama3.1:8b

# List available models
kubectl exec -n llm-serving $OLLAMA_POD -- ollama list
```

### Step 7.2 — For air-gapped environments (GDC production)

In a real air-gapped GDC, you cannot pull from the internet.
Pre-load models using this approach:

```bash
# On a machine WITH internet access:
# 1. Pull models to local Ollama
ollama pull gemma2:9b
ollama pull llama3.1:8b

# 2. Find model blobs on disk
# Linux: ~/.ollama/models/
# macOS: ~/.ollama/models/

# 3. Package into a container image
cat <<EOF > Dockerfile.models
FROM ollama/ollama:latest
COPY .ollama/models /root/.ollama/models
EOF

docker build -t YOUR_REGISTRY/ollama-with-models:v1 .

# 4. Push to your internal container registry (OCI registry on GDC)
docker push YOUR_REGISTRY/ollama-with-models:v1

# 5. In GDC, use this image instead of ollama/ollama:latest
# Change the Deployment image field to YOUR_REGISTRY/ollama-with-models:v1
# Models are already present — no pull needed
```

---

## PART 8 — TEST THE API

### Step 8.1 — Quick test from inside the cluster

```bash
# Spin up a temporary test pod inside the cluster
kubectl run test-client \
  --image=curlimages/curl:latest \
  --restart=Never \
  --rm -it \
  --namespace=llm-serving \
  -- sh

# Inside the pod, run:
curl http://ollama-service.llm-serving.svc.cluster.local:11434/api/tags

# Expected response:
# {"models":[{"name":"gemma2:2b","modified_at":"...","size":...}]}
```

### Step 8.2 — Test an actual inference call

```bash
# From inside the test pod:
curl -X POST http://ollama-service.llm-serving.svc.cluster.local:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma2:2b",
    "prompt": "Return JSON only. A DAG called sales_etl failed with error: FileNotFoundError: /data/sales/2024-01-15.csv not found. What is the root cause and fix? Format: {\"root_cause\": \"\", \"fix\": \"\"}",
    "format": "json",
    "stream": false
  }'
```

### Step 8.3 — Test from your Airflow namespace

```bash
# Airflow runs in a different namespace — verify cross-namespace DNS works
kubectl run test-from-airflow \
  --image=curlimages/curl:latest \
  --restart=Never \
  --rm -it \
  --namespace=airflow \        # or your Airflow namespace
  -- curl http://ollama-service.llm-serving.svc.cluster.local:11434/api/tags

# If this returns the model list, your Airflow DAGs can reach Ollama
```

---

## PART 9 — NETWORK POLICY (enterprise security)

Lock down Ollama so ONLY Airflow can call it — nothing else.

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ollama-ingress-policy
  namespace: llm-serving
spec:
  podSelector:
    matchLabels:
      app: ollama
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # Allow ONLY from Airflow namespace
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: airflow
      ports:
        - protocol: TCP
          port: 11434
    # Allow from monitoring (Prometheus scraping)
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: monitoring
      ports:
        - protocol: TCP
          port: 11434
  egress:
    # Allow DNS resolution only (port 53)
    - ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
    # NO other egress — model never calls out to internet
EOF
```

```bash
# Apply the namespace label so the NetworkPolicy selector works
kubectl label namespace airflow kubernetes.io/metadata.name=airflow
kubectl label namespace llm-serving kubernetes.io/metadata.name=llm-serving
```

---

## PART 10 — MONITORING & RESOURCE LIMITS

### Step 10.1 — Add resource quota to the namespace

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: llm-serving-quota
  namespace: llm-serving
spec:
  hard:
    requests.cpu: "8"
    requests.memory: 20Gi
    limits.cpu: "16"
    limits.memory: 32Gi
    persistentvolumeclaims: "2"
EOF
```

### Step 10.2 — ConfigMap for model configuration

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: ollama-config
  namespace: llm-serving
data:
  DEFAULT_MODEL: "gemma2:9b"
  FALLBACK_MODEL: "gemma2:2b"
  RCA_MODEL: "llama3.1:8b"
  ANOMALY_EXPLAIN_MODEL: "gemma2:2b"
  MAX_TOKENS: "512"
  TEMPERATURE: "0.1"         # Low temperature = more deterministic JSON output
EOF
```

### Step 10.3 — Basic health check script

```bash
cat <<'EOF' > check-ollama.sh
#!/bin/bash
NAMESPACE=llm-serving
POD=$(kubectl get pods -n $NAMESPACE -l app=ollama -o jsonpath='{.items[0].metadata.name}')

echo "=== Ollama Pod Status ==="
kubectl get pod $POD -n $NAMESPACE

echo ""
echo "=== Resource Usage ==="
kubectl top pod $POD -n $NAMESPACE 2>/dev/null || echo "metrics-server not available"

echo ""
echo "=== Loaded Models ==="
kubectl exec -n $NAMESPACE $POD -- ollama list

echo ""
echo "=== PVC Usage ==="
kubectl get pvc -n $NAMESPACE
EOF

chmod +x check-ollama.sh
```

---

## PART 11 — OPTIONAL: HELM-BASED INSTALL

If your team prefers Helm (consistent with how you deployed Airflow):

```bash
# Add Ollama community Helm chart
helm repo add ollama-helm https://otwld.github.io/ollama-helm/
helm repo update

# Install with GPU values
helm install ollama ollama-helm/ollama \
  --namespace llm-serving \
  --create-namespace \
  --set ollama.gpu.enabled=true \
  --set ollama.gpu.type=nvidia \
  --set ollama.gpu.number=1 \
  --set ollama.models[0]=gemma2:9b \
  --set ollama.models[1]=llama3.1:8b \
  --set persistentVolume.enabled=true \
  --set persistentVolume.size=50Gi \
  --set service.type=ClusterIP \
  --set resources.requests.memory=8Gi \
  --set resources.limits.memory=16Gi

# Install with CPU-only values
helm install ollama ollama-helm/ollama \
  --namespace llm-serving \
  --create-namespace \
  --set ollama.gpu.enabled=false \
  --set ollama.models[0]=gemma2:2b \
  --set persistentVolume.enabled=true \
  --set persistentVolume.size=20Gi \
  --set service.type=ClusterIP \
  --set resources.requests.memory=6Gi \
  --set resources.limits.memory=10Gi

# Check install status
helm status ollama -n llm-serving
kubectl get all -n llm-serving
```

---

## PART 12 — AIRFLOW INTEGRATION REFERENCE

Once Ollama is running, use this URL pattern in all your DAGs:

```python
# In your Airflow DAG or callback:
OLLAMA_BASE_URL = "http://ollama-service.llm-serving.svc.cluster.local:11434"

# Generate endpoint (for RCA, anomaly explanation)
OLLAMA_GENERATE_URL = f"{OLLAMA_BASE_URL}/api/generate"

# Chat endpoint (OpenAI-compatible, for more structured use)
OLLAMA_CHAT_URL = f"{OLLAMA_BASE_URL}/api/chat"

# Health check endpoint
OLLAMA_HEALTH_URL = f"{OLLAMA_BASE_URL}/api/tags"

# Example Python call from within a DAG task or callback:
import requests
import json

def call_llm(prompt: str, model: str = "gemma2:9b") -> dict:
    response = requests.post(
        OLLAMA_GENERATE_URL,
        json={
            "model": model,
            "prompt": prompt,
            "format": "json",   # Force JSON output
            "stream": False,
            "options": {
                "temperature": 0.1,   # Low = deterministic
                "num_predict": 512,   # Max output tokens
            }
        },
        timeout=120  # 2 min timeout for CPU mode
    )
    response.raise_for_status()
    return json.loads(response.json()["response"])
```

---

## TROUBLESHOOTING

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Pod stuck in `Pending` | No GPU nodes available | Use CPU mode or check node pool |
| Pod stuck in `ContainerCreating` | PVC not bound | Check `kubectl get pvc -n llm-serving` |
| `OOMKilled` | Not enough memory | Increase memory limits or use 2B model |
| Slow responses (>60s) | CPU mode with large model | Switch to gemma2:2b or add GPU |
| `Connection refused` from Airflow | Wrong namespace in URL | Ensure full DNS: `ollama-service.llm-serving.svc.cluster.local` |
| `403 Forbidden` from Airflow | NetworkPolicy blocking | Check namespace labels match policy |
| Models missing after pod restart | PVC not mounted | Verify `volumeMounts` in deployment |
| `CUDA out of memory` | Model too large for GPU | Use 2B or 7B model; check GPU VRAM |

---

## SUMMARY: WHAT YOU HAVE AFTER THIS SETUP

```
GKE Cluster
├── namespace: llm-serving
│   ├── Deployment: ollama          (1 replica, CPU or GPU)
│   ├── Service: ollama-service     (ClusterIP :11434 — internal only)
│   ├── PVC: ollama-models-pvc      (50GB — model weights persist here)
│   ├── NetworkPolicy               (only Airflow namespace can reach it)
│   └── ConfigMap: ollama-config    (model names, params)
│
└── namespace: airflow
    └── DAGs call:
        http://ollama-service.llm-serving.svc.cluster.local:11434/api/generate
```

Zero external traffic. Model weights on persistent disk.
Identical architecture to GDC air-gapped deployment.

---

*Next step: Airflow DAG with on_failure_callback calling this endpoint for RCA*
*Guide version 1.0 — Data Engineering Team — March 2026*
