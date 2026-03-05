This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Operations: Scheduler (scheduled newsletter sends)

To send newsletters that are scheduled for a given time, call the scheduler run endpoint periodically (e.g. via a cron job or hosted cron service).

- **Endpoint:** `POST /api/scheduler/run`
- **Auth:** If `ADMIN_SECRET` is set, send header `x-admin-secret: <your-secret>`.
- **Body:** None required.
- **Behavior:** Finds all schedules with `status: pending` and `sendAt <= now`, sends the newsletter to all active subscribers, updates schedule and email logs.

**Example cron (every 5 minutes):**

```bash
# With admin protection (set ADMIN_SECRET in env)
curl -X POST https://your-domain.com/api/scheduler/run \
  -H "x-admin-secret: your-secret"
```

Use your platform's cron (e.g. Vercel Cron, GitHub Actions, or a system crontab) to run this at the desired interval (e.g. every 5 minutes).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
