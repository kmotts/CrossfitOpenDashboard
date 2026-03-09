# CrossFit Open Dashboard

A live leaderboard dashboard for the CrossFit Open — histograms, scatter plots, range filters, and athlete lookup.

## Features
- **Score Histogram** — overlay or side-by-side by gender
- **Score vs Age / Height / Weight** scatter plots with hover tooltips
- **Sidebar Filters** — dual-handle sliders for Age, Height, Weight, Score
- **Gender Toggle** — All / Men / Women
- **Athlete Lookup** — search by name; highlighted in gold across all charts + table
- **Sortable Table** — click column headers; paginated
- **Year + Scale** — 2022–2025, Rx / Scaled / Foundations

---

## Deploy to GitHub Pages

```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/YOUR/crossfit-open-dashboard.git
git push -u origin main
```
Settings → Pages → Source: main / root → Save.

---

## Enable Live Data via Cloudflare Worker

GitHub Pages is static-only. The CrossFit API blocks direct browser requests (CORS).
Solution: a **Cloudflare Worker** proxy — free for 100k requests/day, ~3 min setup.

1. Sign up at cloudflare.com (free)
2. Workers & Pages → Create → Create Worker → name it `crossfit-proxy` → Deploy
3. Click **Edit Code**, delete all, paste contents of `worker/index.js`, Deploy
4. Copy your worker URL: `https://crossfit-proxy.YOUR_NAME.workers.dev`
5. In `index.html`, set: `const WORKER_URL = 'https://crossfit-proxy.YOUR_NAME.workers.dev';`
6. Commit and push

---

## CrossFit API Reference

`https://c3po.crossfit.com/api/competitions/v2/competitions/open/{YEAR}/leaderboards`

| Param | Values |
|---|---|
| division | 1=Men, 2=Women, 18=Men35-39, 19=Women35-39 |
| scaled | 0=Rx, 1=Scaled, 2=Foundations |
| region | 0=All |
| page | 1,2,3… |

---

*Not affiliated with CrossFit, Inc.*
"# CrossfitOpenDashboard" 
