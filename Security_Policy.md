# Security Policy

## Reporting a Vulnerability
Please report privately via GitHub Security Advisories
(github.com/midoaistore/mido-landing/security/advisories/new)
or email security@[your-domain]. Do not open a public issue.

We aim to acknowledge within 5 business days and provide a fix
timeline within 14 days.

## Scope
In scope: worker.js, index.html, bacterium-lite.html.
Out of scope: Cloudflare, Groq, Tavily (report to the respective vendor).

## Supported Versions
Only the latest release receives security fixes.

## Handling of Secrets
- Admin or provider secrets must never be read from URL query parameters.
- Secrets must never be persisted in localStorage or sessionStorage.
- Secrets must be stored exclusively as Cloudflare Worker Secrets.
- Any credential that may have been exposed must be rotated immediately,
  even if no unauthorized use is confirmed.

## Credit
Valid reports may be credited in release notes unless anonymity is requested.
