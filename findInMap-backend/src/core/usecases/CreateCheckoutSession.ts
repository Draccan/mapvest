import Stripe from "stripe";

import GroupRepository from "../dependencies/GroupRepository";
import CheckoutSessionDto, {
    makeCheckoutSessionDto,
} from "../dtos/CheckoutSessionDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class CreateCheckoutSession {
    constructor(
        private groupRepository: GroupRepository,
        private stripe: Stripe,
        private proPriceId: string,
        private frontendUrl: string,
    ) {}

    async exec(userId: string, groupId: string): Promise<CheckoutSessionDto> {
        const groups = await this.groupRepository.findByUserId(userId);
        const detailedGroup = groups.find((g) => g.group.id === groupId);

        if (!detailedGroup) {
            throw new NotAllowedActionError(
                "User does not have access to this group",
            );
        }

        const session = await this.stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{ price: this.proPriceId, quantity: 1 }],
            metadata: { groupId, userId },
            success_url: `${this.frontendUrl}/payment/success`,
            cancel_url: `${this.frontendUrl}/payment/cancelled`,
        });

        if (!session.url) {
            throw new Error("Failed to create checkout session");
        }

        return makeCheckoutSessionDto(session);
    }
}
