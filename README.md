# Vuln Testbed NodeJS

This is a deliberately vulnerable Node.js app to test the **AI DevSecOps workflow**.

## Vulnerable Packages
- **express 4.16.0** → multiple CVEs
- **lodash 4.17.19** → prototype pollution (CVE-2021-23337)
- **request 2.88.0** → deprecated, known vulns
- **jsonwebtoken 8.2.1** → security issues in older versions
- **xmldom 0.1.27** → XXE risks

## Usage
```bash
npm install
npm start
