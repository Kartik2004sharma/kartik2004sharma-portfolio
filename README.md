# Kartik Sharma — Portfolio

A production-ready, Minecraft-inspired block-world portfolio built with Next.js, TypeScript, Tailwind CSS, Motion, Canvas, and Playwright.

## Local setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add a Resend API key plus verified sender to enable contact-form delivery. Without those values, the form safely offers a direct-email fallback.

The resume PDF and its browser-safe preview are already included in `public/`.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```
