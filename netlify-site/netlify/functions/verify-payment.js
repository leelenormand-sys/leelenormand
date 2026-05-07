const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { session_id } = event.queryStringParameters || {};

  if (!session_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing session_id' }) };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paid: session.payment_status === 'paid',
        status: session.payment_status,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
