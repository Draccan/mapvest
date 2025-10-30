import { UserGroupRole } from "../commons/enums";
import DetailedGroupEntity from "../entities/DetailedGroupEntity";

export default interface GroupDto {
    id: string;
    name: string;
    role: UserGroupRole;
}

export function makeGroupDto(
    detailedGroupEntity: DetailedGroupEntity,
): GroupDto {
    return {
        id: detailedGroupEntity.group.id,
        name: detailedGroupEntity.group.name,
        role: detailedGroupEntity.role,
    };
}
