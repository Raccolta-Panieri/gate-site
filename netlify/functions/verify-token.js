exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };
  try {
    const body = JSON.parse(event.body || '{}');
    const token = body.token;
    if (!token) return { statusCode: 400, body: JSON.stringify({ success:false, error: 'token missing' }) };

    const UPSTASH_REST_URL = process.env.UPSTASH_REST_URL;
    const UPSTASH_REST_TOKEN = process.env.UPSTASH_REST_TOKEN;
    if (!UPSTASH_REST_URL || !UPSTASH_REST_TOKEN) return { statusCode: 500, body: JSON.stringify({ success:false, error: 'env missing' }) };

    const getUrl = `${UPSTASH_REST_URL}/GET/${encodeURIComponent(token)}`;
    const getResp = await fetch(getUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${UPSTASH_REST_TOKEN}` }});
    const getJson = await getResp.json();
    if (getJson.error) return { statusCode: 200, body: JSON.stringify({ success:false, error: 'Upstash error' }) };

    const telegram = getJson.result;
    if (!telegram) return { statusCode: 200, body: JSON.stringify({ success:false, error: 'Token non valido o scaduto' }) };

    // monouso
    const delUrl = `${UPSTASH_REST_URL}/DEL/${encodeURIComponent(token)}`;
    await fetch(delUrl, { method: 'POST', headers: { 'Authorization': `Bearer ${UPSTASH_REST_TOKEN}` }});

    return { statusCode: 200, body: JSON.stringify({ success:true, telegram }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success:false, error: 'server error' }) };
  }
};