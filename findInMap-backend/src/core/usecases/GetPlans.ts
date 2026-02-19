import GroupRepository from "../dependencies/GroupRepository";
import PlanDto, { makePlanDto } from "../dtos/PlanDto";

export default class GetPlans {
    constructor(private groupRepository: GroupRepository) {}

    async exec(): Promise<PlanDto[]> {
        const planEntities = await this.groupRepository.findPlans();
        return planEntities.map((planEntity) => makePlanDto(planEntity));
    }
}
