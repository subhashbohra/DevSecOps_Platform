As part of our dependency management strategy, we have enabled Renovate Bot to run twice weekly on our repositories. Renovate Bot’s core functionality is to keep software dependencies up to date and to highlight vulnerabilities identified from our manifests.

We have configured Renovate Bot to raise security-specific pull requests only. This means:

If a dependency version is flagged with a known security vulnerability, Renovate Bot will automatically create a PR with the required version bump.

The PR will include details of the related vulnerabilities for visibility and tracking.

Non-security updates (major, minor, or patch version bumps) will not trigger a PR at this time, as per current directive, to reduce noise and unnecessary churn.

Please note:

Some dependencies may remain on older versions if they do not have a reported security issue.

There may still be vulnerabilities in dependencies not covered by this process. These will need to be reviewed separately as part of our broader vulnerability management approach.

This configuration helps us focus on critical security updates while maintaining control over overall dependency upgrades.
