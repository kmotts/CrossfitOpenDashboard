/**
 * CrossFit Open CORS Proxy — Cloudflare Worker
 *
 * Proxies requests to the CrossFit Games API, adding CORS headers
 * so the GitHub Pages dashboard can fetch live leaderboard data.
 *
 * Deploy:
 *   1. Sign up at cloudflare.com (free)
 *   2. Go to Workers & Pages → Create Worker
 *   3. Paste this file's contents into the editor
 *   4. Click "Deploy"
 *   5. Copy your worker URL (e.g. https://crossfit-proxy.YOUR_NAME.workers.dev)
 *   6. In index.html, set: const WORKER_URL = 'https://crossfit-proxy.YOUR_NAME.workers.dev'
 *
 * The worker URL format:
 *   https://YOUR_WORKER.workers.dev/proxy?url=ENCODED_CROSSFIT_URL
 */

const ALLOWED_ORIGINS = [
  // Add your GitHub Pages URL here, e.g.:
  // 'https://your-username.github.io',
  // 'https://your-custom-domain.com',
];

const CF_API_HOST = 'c3po.crossfit.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',   // Lock down to your domain in production
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', proxy: 'crossfit-open' }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Only allow /proxy route
    if (url.pathname !== '/proxy') {
      return new Response(JSON.stringify({ error: 'Use /proxy?url=ENCODED_URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const targetParam = url.searchParams.get('url');
    if (!targetParam) {
      return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    let targetUrl;
    try {
      targetUrl = new URL(decodeURIComponent(targetParam));
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Security: only allow CrossFit API
    if (targetUrl.hostname !== CF_API_HOST) {
      return new Response(JSON.stringify({ error: 'Only CrossFit API proxying is allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    try {
      const upstream = await fetch(targetUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CrossFitDashboard/1.0)',
          'Accept': 'application/json',
        },
        cf: { cacheEverything: true, cacheTtl: 300 }, // Cache 5 min
      });

      const body = await upstream.text();

      return new Response(body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          ...CORS_HEADERS,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Upstream fetch failed', detail: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }
  },
};
