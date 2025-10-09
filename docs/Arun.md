Perfect — that’s actually even better context 👍
Since your enterprise uses **OpenShift**, you can still do *all* the same checks directly from the **OpenShift Web Console** or CLI (`oc`) — the commands are just slightly different.

Let’s go step-by-step in **OpenShift terms** so you can diagnose why DevLake is still giving you `operation failed`.

---

## 🧩 1. **Check Logs of config-api Pod (via OpenShift)**

In OpenShift UI:

1. Go to **Project → devlake namespace (or whichever you used)**
2. Navigate to **Workloads → Pods → devlake-config-api-xxxx**
3. Click **Logs** tab
4. In the filter/search bar, type:

   ```
   github
   ```

   or

   ```
   error
   ```

Look for messages like:

```
github: 401 Unauthorized
github: 404 Not Found
x509: certificate signed by unknown authority
connection timeout
```

> 🔍 This message tells us *exactly* what went wrong — token, SSL, proxy, or wrong endpoint.

You can also do it via CLI:

```bash
oc logs pod/<config-api-pod-name> -n <namespace> | grep github
```

---

## 🧩 2. **Open a Shell into the Pod (Test API Manually)**

From OpenShift UI:

* Open your **`devlake-config-api`** pod
* Click **“Terminal”** tab (it opens a shell inside the container)

Now run this command:

```bash
curl -v -H "Authorization: token <YOUR_PAT>" https://api.github.com/user
```

✅ Expected output:

```json
{"login": "your-username", "id": 123456, ...}
```

❌ If you see:

```json
{"message": "Bad credentials"}
```

then:

* Your token isn’t **SSO authorized**, or
* You’re using a **Fine-grained** token (use Classic).

If you see a **timeout** or **SSL** error, your network or certificate setup is blocking it.

---

## 🧩 3. **Check Environment Variables Inside Pod**

In the same OpenShift terminal (no kubectl needed):

```bash
env | grep -E "VERIFY_SSL|HTTP_PROXY|HTTPS_PROXY|NO_PROXY"
```

You should see:

```
VERIFY_SSL=false
NO_PROXY=localhost,127.0.0.1,github.com,api.github.com
```

If not, the Helm env settings didn’t propagate to your OpenShift deployment.

Fix this by editing your **Helm values.yaml**:

```yaml
config-api:
  env:
    VERIFY_SSL: "false"
    NO_PROXY: "localhost,127.0.0.1,github.com,api.github.com"
```

Then redeploy:

```bash
helm upgrade devlake apache/devlake -f values.yaml -n <namespace>
```

---

## 🧩 4. **Confirm Endpoint**

For your case:

```
Endpoint URL: https://api.github.com/
```

not

```
https://github.com/<LZNAME>
```

And **PAT must be Classic**, not fine-grained.

> You can verify your token type at
> `https://github.com/settings/tokens` →
> if it says *Fine-grained personal access token*, regenerate as *Classic*.

---

## 🧩 5. **SSO Authorization**

This is the #1 cause in GitHub Enterprise Cloud orgs with Landing Zones.

👉 Go to:
`https://github.com/settings/tokens`
→ find your token → click **“Configure SSO”**
→ click **Authorize** next to your `<LZNAME>` org.

Without this step, GitHub will return `401 Unauthorized` to DevLake.

---

## 🧩 6. **If You See Certificate Errors**

Inside OpenShift, internal SSL policies may block outbound calls.

You can temporarily disable SSL verification globally (in Helm):

```yaml
config-api:
  env:
    VERIFY_SSL: "false"
```

If you want a proper enterprise fix:

* Mount your internal CA cert to `/etc/pki/ca-trust/source/anchors/`
* Run:

  ```
  update-ca-trust
  ```

  inside your container image (ask platform team to bake this into custom image if needed)

---

## 🧩 7. **If Proxy Is Used**

Corporate OpenShift clusters usually go through an outbound proxy.
Check with your infra team if you need these variables:

```yaml
config-api:
  env:
    HTTPS_PROXY: "http://<proxy_host>:<proxy_port>"
    HTTP_PROXY: "http://<proxy_host>:<proxy_port>"
    NO_PROXY: "localhost,127.0.0.1,github.com,api.github.com"
```

You can test connectivity from the pod with:

```bash
curl -v --proxy http://<proxy_host>:<proxy_port> https://api.github.com
```

---

## 🧠 8. Summary of What to Check

| Step | Check      | Command / Location                                                 | Expected         |         |
| ---- | ---------- | ------------------------------------------------------------------ | ---------------- | ------- |
| 1    | Logs       | OpenShift → Pod logs → Search `github`                             | Real error       |         |
| 2    | Token      | `curl -H "Authorization: token <PAT>" https://api.github.com/user` | User JSON        |         |
| 3    | Env vars   | `env                                                               | grep VERIFY_SSL` | `false` |
| 4    | Endpoint   | Form shows `https://api.github.com/`                               | ✅                |         |
| 5    | Token type | GitHub settings                                                    | Classic          |         |
| 6    | SSO        | GitHub → Configure SSO                                             | Authorized       |         |
| 7    | Proxy      | Check `NO_PROXY` includes `github.com`                             | ✅                |         |
| 8    | SSL        | `VERIFY_SSL=false`                                                 | ✅                |         |

---

💡 Once you do step 1 and see what the actual error line says (for example, `401`, `404`, or `x509`), I can give you the *exact one-line fix*.

Would you like me to give you the **ready-to-copy `curl` test commands** and `env` checks formatted specifically for OpenShift terminal (to paste directly in that pod’s shell)?
That way you can confirm connectivity, SSL, and auth in under 2 minutes.
