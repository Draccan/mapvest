import Stripe from "stripe";

export default interface CheckoutSessionDto {
    url: string;
}

export function makeCheckoutSessionDto(
    session: Stripe.Response<Stripe.Checkout.Session>,
): CheckoutSessionDto {
    return {
        url: session.url || "",
    };
}
