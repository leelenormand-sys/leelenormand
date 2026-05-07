const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { cardIds, userInfo } = JSON.parse(event.body);
    const origin = event.headers.origin || 'https://www.leelenormand.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['promptpay'],
      line_items: [{
        price_data: {
          currency: 'thb',
          product_data: {
            name: 'อ่านไพ่ Lenormand 5 ใบ — ลี เลอโนมองด์',
            description: 'คำทำนายเชิงลึก 5 ใบ วิเคราะห์ครบทุกด้าน',
          },
          unit_amount: 9900, // 99 THB in satang
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&cards=${encodeURIComponent(JSON.stringify(cardIds))}&info=${encodeURIComponent(JSON.stringify(userInfo))}`,
      cancel_url: `${origin}/?cancelled=true`,
      metadata: {
        cardIds: JSON.stringify(cardIds),
        userInfo: JSON.stringify(userInfo),
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
