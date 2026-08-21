// api/chat.js
// Secure server-side endpoint. Runs only on Vercel's servers — the browser
// never sees this code or the API key. Deploy target: Vercel Node.js (no
// Python runtime needed).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Server misconfigured: ANTHROPIC_API_KEY is not set in Vercel Project Settings → Environment Variables.'
    });
    return;
  }

  const { system, messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: '"messages" must be a non-empty array.' });
    return;
  }

  // Basic shape validation so we never forward garbage to the API.
  const cleanMessages = messages
    .filter(m => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .map(m => ({ role: m.role, content: m.content }));

  if (cleanMessages.length === 0) {
    res.status(400).json({ error: 'No valid messages provided.' });
    return;
  }

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        system: typeof system === 'string' ? system : '',
        messages: cleanMessages
      })
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      res.status(anthropicRes.status).json({
        error: data?.error?.message || 'Anthropic API returned an error.'
      });
      return;
    }

    const textBlock = Array.isArray(data.content)
      ? data.content.find(block => block.type === 'text')
      : null;

    res.status(200).json({ reply: textBlock ? textBlock.text : '' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reach the Anthropic API.' });
  }
}
