// FILE: src/routes/webhooks/stripe.ts
import express from 'express';
import Stripe from 'stripe';
import prisma from '../../prisma/client';


const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET || '', { apiVersion: '2022-11-15' });

// raw body required; express.json() should NOT be used for this route in index.ts when mounted raw.
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
const sig = req.headers['stripe-signature'] as string;
try {
const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
if (event.type === 'checkout.session.completed') {
const session: any = event.data.object;
// Example: session.metadata contains userId and courseId if set
const userId = session.metadata?.userId;
const courseId = session.metadata?.courseId;
const amount = session.amount_total / 100.0;
const currency = session.currency?.toUpperCase();
// create payment record + enrollment
await prisma.payment.create({ data: {
userId, amount, currency, provider: 'stripe', providerPaymentId: session.id, status: 'success'
}});
if (userId && courseId) {
await prisma.enrollment.create({ data: { userId, courseId, progress: 0 } });
}
}
res.json({ received: true });
} catch (err:any) {
console.error('Stripe webhook error', err.message);
res.status(400).send(`Webhook Error: ${err.message}`);
}
});


export default router;
