# 🔐 CodeQL + Renovate: Shifting Security Left

---

## 📌 One-Slide Summary

### **SCA with RenovateBot (Dependencies)**
- **What it does**: Scans dependency manifests (Maven, npm, pip, etc.)
- **Output**: Weekly **PRs** with version upgrades + CVE details
- **Value**: Keeps 3rd-party libraries patched automatically
- **Impact**: Removes 70–90% of known vulnerabilities before release

### **SAST with CodeQL (Custom Code)**
- **What it does**: Treats code as data → queries detect security flaws (SQLi, XSS, CSRF)
- **Output**: Runs on **every PR** → inline annotations, fail build if High/Critical
- **Baseline**: Main branch scans → results in **GitHub Security tab**
- **Impact**: Developers fix vulnerabilities at PR time → true shift-left

---

## 🔎 How They Work Together
- **RenovateBot** (SCA) → Automated dependency PRs (weekly)
- **CodeQL** (SAST) → Custom code analysis on every PR + baseline on main
- **Combined Coverage**: ~70–80% of vulnerabilities caught **before release**
- **Remaining Gaps**: Veracode complements with **binary scanning + compliance reporting**

---

## ✅ Key Takeaways
- Renovate = **Automated SCA** → fixes known CVEs
- CodeQL = **Comprehensive SAST** → finds logic flaws in custom code
- Veracode = **Compliance + binaries**

**Together → Proactive, developer-first security integrated into PR workflow and main branch baseline.**

