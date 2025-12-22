import { eq, and } from "drizzle-orm";
import mem from "mem";

import { UserGroupRole } from "../../core/commons/enums";
import DbOrTransaction from "../../core/dependencies/DatabaseTransaction";
import GroupRepository from "../../core/dependencies/GroupRepository";
import UpdateGroupDto from "../../core/dtos/UpdateGroupDto";
import DetailedGroupEntity from "../../core/entities/DetailedGroupEntity";
import GroupEntity from "../../core/entities/GroupEntity";
import { db } from "../../db";
import { groups, usersGroups } from "../../db/schema";
import { makeDetailedGroupEntity } from "./converters/makeDetailedGroupEntity";
import { makeGroupEntity } from "./converters/makeGroupEntity";

export class DrizzleGroupRepository implements GroupRepository {
    async findByUserId(userId: string): Promise<DetailedGroupEntity[]> {
        const results = await db
            .select({
                group: groups,
                role: usersGroups.role,
            })
            .from(usersGroups)
            .innerJoin(groups, eq(usersGroups.groupId, groups.id))
            .where(eq(usersGroups.userId, userId));

        return results.map((result) =>
            makeDetailedGroupEntity(result.group, result.role),
        );
    }

    memoizedFindByUserId = mem(this.findByUserId, {
        maxAge: 1000 * 60,
    });

    async createGroup(
        groupName: string,
        userId: string,
        dbInstance: DbOrTransaction = db,
    ): Promise<GroupEntity> {
        const [createdGroup] = await dbInstance
            .insert(groups)
            .values({
                name: groupName,
                createdBy: userId,
            })
            .returning();

        await this.addUserToGroup(
            userId,
            createdGroup.id,
            UserGroupRole.Owner,
            dbInstance,
        );

        return makeGroupEntity(createdGroup);
    }

    async addUserToGroup(
        userId: string,
        groupId: string,
        role: UserGroupRole,
        dbInstance: DbOrTransaction = db,
    ): Promise<void> {
        await dbInstance.insert(usersGroups).values({
            userId: userId,
            groupId: groupId,
            role: role,
        });
    }

    async updateGroup(
        groupId: string,
        userId: string,
        data: UpdateGroupDto,
    ): Promise<GroupEntity | null> {
        const userGroups = await db
            .select()
            .from(usersGroups)
            .where(
                and(
                    eq(usersGroups.groupId, groupId),
                    eq(usersGroups.userId, userId),
                ),
            );

        if (userGroups.length === 0) {
            return null;
        }

        const [updatedGroup] = await db
            .update(groups)
            .set({
                name: data.name,
            })
            .where(eq(groups.id, groupId))
            .returning();

        if (!updatedGroup) {
            return null;
        }

        return makeGroupEntity(updatedGroup);
    }
}
