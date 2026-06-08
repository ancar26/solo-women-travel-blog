exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email;
  try {
    const body = JSON.parse(event.body);
    email = body.email;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      email,
      listIds: [3],
      updateEnabled: true,
    }),
  });

  if (response.ok || response.status === 204) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  const err = await response.json().catch(() => ({}));
  // 'Contact already in list' is fine — treat as success
  if (err.code === 'duplicate_parameter') {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 500, body: JSON.stringify({ error: 'Subscription failed' }) };
};
