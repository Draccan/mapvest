import { UserGroupRole } from "../commons/enums";
import DetailedGroupEntity from "../entities/DetailedGroupEntity";
import GroupEntity from "../entities/GroupEntity";

export default interface GroupDto {
    id: string;
    name: string;
    role: UserGroupRole;
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
        };
    }
    return {
        id: entity.id,
        name: entity.name,
    };
}
