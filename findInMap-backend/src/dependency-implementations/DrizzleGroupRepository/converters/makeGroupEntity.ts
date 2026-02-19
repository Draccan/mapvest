import GroupEntity from "../../../core/entities/GroupEntity";
import { Group } from "../../../db/schema";

export const makeGroupEntity = (
    group: Group,
    planName: string | null = null,
): GroupEntity => {
    return {
        id: group.id,
        name: group.name,
        createdBy: group.createdBy,
        createdAt: group.createdAt ?? new Date(),
        updatedAt: group.updatedAt ?? new Date(),
        planName,
        planEndDate: group.planEndDate ?? null,
    };
};
