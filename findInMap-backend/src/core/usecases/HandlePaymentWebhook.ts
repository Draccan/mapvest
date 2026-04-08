import Stripe from "stripe";

import { Plan, StripeEvent } from "../commons/enums";
import computePlan from "../commons/utilities/computePlan";
import GroupRepository from "../dependencies/GroupRepository";
import LoggerService from "../services/LoggerService";

export default class HandlePaymentWebhook {
    constructor(private groupRepository: GroupRepository) {}

    async exec(event: Stripe.Event): Promise<void> {
        if (event.type !== StripeEvent.CheckoutSessionCompleted) {
            return;
        }

        const session = event.data.object as Stripe.Checkout.Session;
        const groupId = session.metadata?.groupId;

        if (!groupId) {
            LoggerService.error("Webhook: missing groupId in session metadata");
            return;
        }

        const plans = await this.groupRepository.findPlans();
        const proPlan = plans.find((p) => p.name === Plan.Pro)!;
        const group = await this.groupRepository.findById(groupId);

        let planEndDate: Date;
        if (
            group &&
            group.planEndDate &&
            computePlan(group.planName, new Date(group.planEndDate)) ===
                Plan.Pro
        ) {
            planEndDate = new Date(group.planEndDate);
            planEndDate.setDate(planEndDate.getDate() + 30);
        } else {
            planEndDate = new Date();
            planEndDate.setDate(planEndDate.getDate() + 30);
        }

        await this.groupRepository.updateGroupPlan(
            groupId,
            proPlan.id,
            planEndDate,
        );

        LoggerService.info(
            `Webhook: Group ${groupId} upgraded to PRO until ${planEndDate.toISOString()}`,
        );
    }
}
