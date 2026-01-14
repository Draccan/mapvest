import { UserGroupRole } from "../../../src/core/commons/enums";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import UpdateUserInGroupDto from "../../../src/core/dtos/UpdateUserInGroupDto";
import DetailedGroupEntity from "../../../src/core/entities/DetailedGroupEntity";
import { UserGroupRelation } from "../../../src/core/entities/UserGroupRelation";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import UpdateUserInGroup from "../../../src/core/usecases/UpdateUserInGroup";

describe("UpdateUserInGroup", () => {
    let groupRepository: jest.Mocked<GroupRepository>;
    let updateUserInGroup: UpdateUserInGroup;

    beforeEach(() => {
        groupRepository = {
            memoizedFindByUserId: jest.fn(),
            findUsersByGroupId: jest.fn(),
            updateUserInGroup: jest.fn(),
        } as any;

        updateUserInGroup = new UpdateUserInGroup(groupRepository);
    });

    describe("exec", () => {
        it("should update user role when owner changes contributor to admin", async () => {
            const requestingUserId = "owner-id";
            const groupId = "group-id";
            const targetUserId = "target-user-id";
            const data: UpdateUserInGroupDto = {
                role: UserGroupRole.Admin,
            };

            const mockGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: requestingUserId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            const mockGroupUsers: UserGroupRelation[] = [
                {
                    userId: requestingUserId,
                    role: UserGroupRole.Owner,
                },
                {
                    userId: targetUserId,
                    role: UserGroupRole.Contributor,
                },
            ];

            groupRepository.memoizedFindByUserId.mockResolvedValue(mockGroups);
            groupRepository.findUsersByGroupId.mockResolvedValue(
                mockGroupUsers,
            );

            await updateUserInGroup.exec(
                requestingUserId,
                groupId,
                targetUserId,
                data,
            );

            expect(groupRepository.updateUserInGroup).toHaveBeenCalledWith(
                targetUserId,
                groupId,
                UserGroupRole.Admin,
            );
        });

        it("should update user role when admin changes contributor to admin", async () => {
            const requestingUserId = "admin-id";
            const groupId = "group-id";
            const targetUserId = "target-user-id";
            const data: UpdateUserInGroupDto = {
                role: UserGroupRole.Admin,
            };

            const mockGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "owner-id",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Admin,
                },
            ];

            const mockGroupUsers: UserGroupRelation[] = [
                {
                    userId: "owner-id",
                    role: UserGroupRole.Owner,
                },
                {
                    userId: requestingUserId,
                    role: UserGroupRole.Admin,
                },
                {
                    userId: targetUserId,
                    role: UserGroupRole.Contributor,
                },
            ];

            groupRepository.memoizedFindByUserId.mockResolvedValue(mockGroups);
            groupRepository.findUsersByGroupId.mockResolvedValue(
                mockGroupUsers,
            );

            await updateUserInGroup.exec(
                requestingUserId,
                groupId,
                targetUserId,
                data,
            );

            expect(groupRepository.updateUserInGroup).toHaveBeenCalledWith(
                targetUserId,
                groupId,
                UserGroupRole.Admin,
            );
        });

        it("should throw error when user does not have access to group", async () => {
            const requestingUserId = "user-id";
            const groupId = "group-id";
            const targetUserId = "target-user-id";
            const data: UpdateUserInGroupDto = {
                role: UserGroupRole.Admin,
            };

            groupRepository.memoizedFindByUserId.mockResolvedValue([]);

            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow(NotAllowedActionError);
            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow("User cannot access this group");
        });

        it("should throw error when user is contributor", async () => {
            const requestingUserId = "contributor-id";
            const groupId = "group-id";
            const targetUserId = "target-user-id";
            const data: UpdateUserInGroupDto = {
                role: UserGroupRole.Admin,
            };

            const mockGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "owner-id",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Contributor,
                },
            ];

            groupRepository.memoizedFindByUserId.mockResolvedValue(mockGroups);

            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow(NotAllowedActionError);
            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow("User must be owner or admin");
        });

        it("should throw error when target user is not in group", async () => {
            const requestingUserId = "owner-id";
            const groupId = "group-id";
            const targetUserId = "target-user-id";
            const data: UpdateUserInGroupDto = {
                role: UserGroupRole.Admin,
            };

            const mockGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: requestingUserId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            const mockGroupUsers: UserGroupRelation[] = [
                {
                    userId: requestingUserId,
                    role: UserGroupRole.Owner,
                },
            ];

            groupRepository.memoizedFindByUserId.mockResolvedValue(mockGroups);
            groupRepository.findUsersByGroupId.mockResolvedValue(
                mockGroupUsers,
            );

            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow(NotAllowedActionError);
            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow("The user to update is not in the group");
        });

        it("should throw error when trying to change owner role", async () => {
            const requestingUserId = "admin-id";
            const groupId = "group-id";
            const targetUserId = "owner-id";
            const data: UpdateUserInGroupDto = {
                role: UserGroupRole.Contributor,
            };

            const mockGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: targetUserId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Admin,
                },
            ];

            const mockGroupUsers: UserGroupRelation[] = [
                {
                    userId: targetUserId,
                    role: UserGroupRole.Owner,
                },
                {
                    userId: requestingUserId,
                    role: UserGroupRole.Admin,
                },
            ];

            groupRepository.memoizedFindByUserId.mockResolvedValue(mockGroups);
            groupRepository.findUsersByGroupId.mockResolvedValue(
                mockGroupUsers,
            );

            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow(NotAllowedActionError);
            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow("Cannot change the role of the group owner");
        });

        it("should throw error when admin tries to change owner role", async () => {
            const requestingUserId = "admin-id";
            const groupId = "group-id";
            const targetUserId = "owner-id";
            const data: UpdateUserInGroupDto = {
                role: UserGroupRole.Admin,
            };

            const mockGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: targetUserId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Admin,
                },
            ];

            const mockGroupUsers: UserGroupRelation[] = [
                {
                    userId: targetUserId,
                    role: UserGroupRole.Owner,
                },
                {
                    userId: requestingUserId,
                    role: UserGroupRole.Admin,
                },
            ];

            groupRepository.memoizedFindByUserId.mockResolvedValue(mockGroups);
            groupRepository.findUsersByGroupId.mockResolvedValue(
                mockGroupUsers,
            );

            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow(NotAllowedActionError);
            await expect(
                updateUserInGroup.exec(
                    requestingUserId,
                    groupId,
                    targetUserId,
                    data,
                ),
            ).rejects.toThrow("Cannot change the role of the group owner");
        });
    });
});
