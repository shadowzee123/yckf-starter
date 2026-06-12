// FILE: src/routes/webhooks.ts
import { Router } from 'express';
import stripeRouter from './webhooks/stripe';


const router = Router();
router.use('/stripe', stripeRouter);


export default router;