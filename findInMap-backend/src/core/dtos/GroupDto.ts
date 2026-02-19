import { Plan, UserGroupRole } from "../commons/enums";
import computePlan from "../commons/utilities/computePlan";
import DetailedGroupEntity from "../entities/DetailedGroupEntity";
import GroupEntity from "../entities/GroupEntity";

export default interface GroupDto {
    id: string;
    name: string;
    role: UserGroupRole;
    plan: Plan;
}

export function makeGroupDto(
    detailedGroupEntity: DetailedGroupEntity,
): GroupDto;
export function makeGroupDto(groupEntity: GroupEntity): Omit<GroupDto, "role">;
export function makeGroupDto(
    entity: DetailedGroupEntity | GroupEntity,
): GroupDto | Omit<GroupDto, "role"> {
    if ("group" in entity) {
        return {
            id: entity.group.id,
            name: entity.group.name,
            role: entity.role,
            plan: computePlan(entity.group.planName, entity.group.planEndDate),
        };
    }
    return {
        id: entity.id,
        name: entity.name,
        plan: computePlan(entity.planName, entity.planEndDate),
    };
}
