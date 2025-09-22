# Vuln Testbed NodeJS

Deliberately vulnerable Node.js project to test SCA / SAST / secret detection / container scanners.

## How to use
1. Create a repo `vuln-testbed-nodejs` and push these files.
2. Add your GitHub Actions workflow (devsecops-mvp.yml).
3. Add secret `OPENAI_API_KEY` if using AI steps.
4. Open a PR or push to branch to trigger Actions.

## Vulnerability signals included (non-exhaustive)
- Outdated dependencies with known advisories (lodash, express, request, axios, xmldom, etc.)
- SQL injection (unsanitized string concat)
- Command injection (child_process.exec with user input)
- Insecure file upload & path handling
- Hardcoded secrets and API keys
- Weak JWT secret / no expiry
- Legacy/insecure crypto usage
- Insecure Docker base image (node:10)
- Potential XML parser issues

> Do **not** run this app on production or expose it publicly. Use it only in a controlled test environment.
