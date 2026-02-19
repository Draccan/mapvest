import PlanEntity from "../entities/PlanEntity";

export default interface PlanDto {
    name: string;
    maxMapPoints: number;
}

export function makePlanDto(planEntity: PlanEntity): PlanDto {
    return {
        name: planEntity.name,
        maxMapPoints: planEntity.maxMapPoints,
    };
}
