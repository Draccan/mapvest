import PlanEntity from "../../../core/entities/PlanEntity";

export const makePlanEntity = (plan: {
    id: string;
    name: string;
    maxMapPoints: number;
}): PlanEntity => {
    return {
        id: plan.id,
        name: plan.name,
        maxMapPoints: plan.maxMapPoints,
    };
};
