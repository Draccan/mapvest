import { UserGroupRole } from "../../../core/commons/enums";
import DetailedGroupEntity from "../../../core/entities/DetailedGroupEntity";
import { Group } from "../../../db/schema";
import { makeGroupEntity } from "./makeGroupEntity";

export const makeDetailedGroupEntity = (
    group: Group,
    role: string,
): DetailedGroupEntity => {
    return {
        group: makeGroupEntity(group),
        role: role as UserGroupRole,
    };
};
