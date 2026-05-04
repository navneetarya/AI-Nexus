/**
 * Cloudflare Worker — AI Nexus Leads -> Notion
 *
 * Notion DB columns (from your actual database):
 *   Lead          — title        (page title, set to email)
 *   Email         — email
 *   Name          — rich_text
 *   Status        — status       (native Notion Status type)
 *   Source/Notes  — rich_text    (optional, left blank)
 *   Date added    — date         (optional)
 *
 * ENVIRONMENT VARIABLES (Cloudflare -> Worker -> Settings -> Variables):
 *   NOTION_TOKEN        — your Integration Token (secret_xxxx...)
 *   NOTION_DATABASE_ID  — 32-char database ID from Notion URL
 */

export default {
  async fetch(request, env) {

    // CORS pre-flight
    if (request.method === 'OPTIONS') {
      return respond(null, 204);
    }

    if (request.method !== 'POST') {
      return respond({ error: 'Method not allowed' }, 405);
    }

    // Env var guard
    if (!env.NOTION_TOKEN) {
      return respond({ error: 'Missing env var: NOTION_TOKEN' }, 500);
    }
    if (!env.NOTION_DATABASE_ID) {
      return respond({ error: 'Missing env var: NOTION_DATABASE_ID' }, 500);
    }

    // Parse body
    let body;
    try { body = await request.json(); }
    catch { return respond({ error: 'Invalid JSON body' }, 400); }

    const email = (body.email || '').trim().toLowerCase();
    const name  = (body.name  || '').trim();

    if (!email || !email.includes('@')) {
      return respond({ error: 'Valid email required.' }, 400);
    }

    const headers = {
      'Authorization': `Bearer ${env.NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };

    // Build payload matching your exact Notion DB column types
    const payload = {
      parent: { database_id: env.NOTION_DATABASE_ID },
      properties: {
        // "Lead" is the title column (page title) — set to email
        Lead: {
          title: [{ text: { content: email } }]
        },
        // "Email" is the email column
        Email: {
          email: email
        },
        // "Name" is a rich_text column
        Name: {
          rich_text: [{ text: { content: name || '' } }]
        },
        // "Status" is native Notion Status type — value: New
        Status: {
          status: { name: 'New' }
        }
      }
    };

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return respond({ success: true });
    }

    const err = await res.json().catch(() => ({ raw: 'could not parse Notion response' }));
    console.error('Notion error:', JSON.stringify(err));
    return respond({ error: 'Notion write failed', detail: err }, 500);
  }
};

function respond(data, status = 200) {
  return new Response(data ? JSON.stringify(data) : null, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
