const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.handler = async (event) => {
  const { session_id } = event.queryStringParameters || {};
  if (!session_id) {
    return { statusCode: 400, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ error: 'Missing session_id' }) };
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return { statusCode: 500, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log('Session status:', session.payment_status);
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({ paid: session.payment_status === 'paid', status: session.payment_status })
    };
  } catch (err) {
    console.error('Verify error:', err.message);
    return { statusCode: 500, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ error: err.message }) };
  }
};
