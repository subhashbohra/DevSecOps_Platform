# Sample DevSecOps Project

This is a deliberately vulnerable Node.js project to test the **AI DevSecOps MVP Workflow**.

## Features
- Express server with basic endpoint
- Uses outdated dependencies (`lodash`, `express`) for vulnerability scanning
- Ready-to-run GitHub Action workflow for:
  - Dependency scanning
  - AI-powered vulnerability explanations
  - Auto PR dashboard

## Run locally
```bash
npm install
npm start
