import GroupEntity from "../../../core/entities/GroupEntity";
import { Group } from "../../../db/schema";

export const makeGroupEntity = (group: Group): GroupEntity => {
    return {
        id: group.id,
        name: group.name,
        createdBy: group.createdBy,
        createdAt: group.createdAt ?? new Date(),
        updatedAt: group.updatedAt ?? new Date(),
    };
};
