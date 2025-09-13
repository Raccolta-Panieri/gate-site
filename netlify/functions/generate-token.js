function randomToken(len = 28) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };
  try {
    const body = JSON.parse(event.body || '{}');
    const telegram = body.telegram;
    if (!telegram) return { statusCode: 400, body: JSON.stringify({ error: 'telegram missing' }) };

    const token = randomToken();
    const ttl = 300; // 5 minuti

    const UPSTASH_REST_URL = process.env.UPSTASH_REST_URL;
    const UPSTASH_REST_TOKEN = process.env.UPSTASH_REST_TOKEN;
    if (!UPSTASH_REST_URL || !UPSTASH_REST_TOKEN) return { statusCode: 500, body: JSON.stringify({ error: 'env missing' }) };

    const setUrl = `${UPSTASH_REST_URL}/SET/${encodeURIComponent(token)}/${encodeURIComponent(telegram)}?EX=${ttl}`;
    const setResp = await fetch(setUrl, { method: 'POST', headers: { 'Authorization': `Bearer ${UPSTASH_REST_TOKEN}` }});
    const setJson = await setResp.json();
    if (setJson.error) return { statusCode: 500, body: JSON.stringify({ error: 'upstash error', detail: setJson }) };

    return { statusCode: 200, body: JSON.stringify({ token }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'server error' }) };
  }
};