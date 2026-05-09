const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }

  try {
    const { cardIds, userInfo } = JSON.parse(event.body || '{}');
    const origin = 'https://www.leelenormand.com';

    console.log('Creating checkout session, cardIds:', cardIds);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['promptpay'],
      line_items: [{
        price_data: {
          currency: 'thb',
          product_data: {
            name: 'อ่านไพ่ Lenormand 5 ใบ — ลี เลอโนมองด์',
            description: 'คำทำนายเชิงลึก 5 ใบ วิเคราะห์ครบทุกด้าน',
          },
          unit_amount: 9900,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://www.leelenormand.com/?session_id={CHECKOUT_SESSION_ID}&cards=${encodeURIComponent(JSON.stringify(cardIds || []))}&info=${encodeURIComponent(JSON.stringify(userInfo || {}))}`,
      cancel_url: `${origin}/?cancelled=true`,
    });

    console.log('Session created:', session.id);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
