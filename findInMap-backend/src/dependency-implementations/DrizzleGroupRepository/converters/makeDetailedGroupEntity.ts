import { UserGroupRole } from "../../../core/commons/enums";
import DetailedGroupEntity from "../../../core/entities/DetailedGroupEntity";
import { Group } from "../../../db/schema";
import { makeGroupEntity } from "./makeGroupEntity";

export const makeDetailedGroupEntity = (
    group: Group,
    role: string,
    planName: string | null = null,
): DetailedGroupEntity => {
    return {
        group: makeGroupEntity(group, planName),
        role: role as UserGroupRole,
    };
};
