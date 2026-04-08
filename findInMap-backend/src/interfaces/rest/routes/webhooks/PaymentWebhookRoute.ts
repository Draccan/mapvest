import express, { Request, Response } from "express";
import Stripe from "stripe";

import HandlePaymentWebhook from "../../../../core/usecases/HandlePaymentWebhook";
import LoggerService from "../../../../core/services/LoggerService";

interface PaymentWebhookRoute {
    path: string;
    middleware: express.RequestHandler;
    handler: (req: Request, res: Response) => Promise<void>;
}

export default (
    handlePaymentWebhook: HandlePaymentWebhook,
    stripe: Stripe,
    stripeWebhookSecret: string,
): PaymentWebhookRoute => {
    return {
        path: "/payments/webhook",
        middleware: express.raw({ type: "application/json" }),
        handler: async (req: Request, res: Response): Promise<void> => {
            const sig = req.headers["stripe-signature"];
            if (!sig) {
                res.status(400).json({
                    error: "Missing stripe-signature header",
                });
                return;
            }

            let event: Stripe.Event;
            try {
                event = stripe.webhooks.constructEvent(
                    req.body,
                    sig,
                    stripeWebhookSecret,
                );
            } catch (err: any) {
                LoggerService.error(
                    `Webhook signature verification failed: ${err.message}`,
                );
                res.status(400).json({
                    error: `Webhook Error: ${err.message}`,
                });
                return;
            }

            try {
                await handlePaymentWebhook.exec(event);
                res.status(200).json({ received: true });
            } catch (err: any) {
                LoggerService.error(
                    `Webhook processing error: ${err.message}`,
                );
                res.status(500).json({
                    error: "Webhook processing failed",
                });
            }
        },
    };
};
