/**
 * Dev placeholder for nginx runtime env injection.
 *
 * In production (nginx image), the container entrypoint OVERWRITES this file
 * at startup, e.g.:
 *
 *   printf 'window.env_={VITE_API_URL:"%s"};' "$API_URL" \
 *     > /usr/share/nginx/html/env.js
 *
 * Both `window.env_` and `window.__APP_ENV__` shapes are read by
 * src/api/api.ts, so the entrypoint may emit either name.
 * This checked-in default just keeps local `vite dev` / previews working.
 */
window.env_ = window.env_ || {};
window.__APP_ENV__ = window.__APP_ENV__ || {};
