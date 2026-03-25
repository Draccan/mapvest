import { AuthorizableAction } from "../../core/commons/enums";
import computePlan from "../../core/commons/utilities/computePlan";
import Authorizer from "../../core/dependencies/Authorizer";
import GroupRepository from "../../core/dependencies/GroupRepository";
import MapRepository from "../../core/dependencies/MapRepository";
import GroupEntity from "../../core/entities/GroupEntity";
import PlanEntity from "../../core/entities/PlanEntity";
import NotAuthorizedError from "../../core/errors/NotAuthorizedError";

const ActionPlanPropertyMap: Record<AuthorizableAction, keyof PlanEntity> = {
    [AuthorizableAction.AddMapPoints]: "maxMapPoints",
};

export class UserActionsAuthorizer implements Authorizer {
    constructor(
        private groupRepository: GroupRepository,
        private mapRepository: MapRepository,
    ) {}

    async checkAction(
        action: AuthorizableAction,
        group: GroupEntity,
        info?: { count?: number },
    ): Promise<void> {
        const planProperty = ActionPlanPropertyMap[action];
        const activePlan = computePlan(group.planName, group.planEndDate);
        const plans = await this.groupRepository.memoizedFindPlans();
        const plan = plans.find((p) => p.name === activePlan);

        if (!plan) {
            throw new NotAuthorizedError(action);
        }

        const limit = plan[planProperty] as number;

        if (action === AuthorizableAction.AddMapPoints) {
            const currentCount =
                await this.mapRepository.countMapPointsByGroupId(group.id);
            const additionalCount = info?.count ?? 1;

            if (currentCount + additionalCount > limit) {
                throw new NotAuthorizedError(action);
            }
        }
    }
}
