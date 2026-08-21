export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not configured.'
    });
  }

  const { system, messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: '"messages" must be a non-empty array.'
    });
  }

  const cleanMessages = messages
    .filter(
      m =>
        m &&
        typeof m.content === 'string' &&
        (m.role === 'user' || m.role === 'assistant')
    )
    .map(m => ({
      role: m.role,
      content: m.content
    }));

  if (cleanMessages.length === 0) {
    return res.status(400).json({
      error: 'No valid messages provided.'
    });
  }

  const groqMessages = [];

  if (typeof system === 'string' && system.trim()) {
    groqMessages.push({
      role: 'system',
      content: system
    });
  }

  groqMessages.push(...cleanMessages);

  try {
    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          max_tokens: 400
        })
      }
    );

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(groqRes.status).json({
        error: data?.error?.message || 'Groq API returned an error.'
      });
    }

    const reply = data?.choices?.[0]?.message?.content || '';

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to reach the Groq API.'
    });
  }
}
