import { UserGroupRole } from "../../../src/core/commons/enums";
import AddUsersToGroup from "../../../src/core/usecases/AddUsersToGroup";
import { mockGroupRepository } from "../../helpers";

describe("AddUsersToGroup", () => {
    const usecase = new AddUsersToGroup(mockGroupRepository);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("exec", () => {
        it("should add users to group successfully when user is owner", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userIds: ["new-user-1", "new-user-2"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.addUsersToGroup).toHaveBeenCalledWith(
                data.userIds,
                groupId,
                UserGroupRole.Contributor,
            );
        });

        it("should add users to group successfully when user is admin", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userIds: ["new-user-1", "new-user-2"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "owner-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.addUsersToGroup).toHaveBeenCalledWith(
                data.userIds,
                groupId,
                UserGroupRole.Contributor,
            );
        });

        it("should throw NotAllowedActionError when user does not have access to group", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userIds: ["new-user-1", "new-user-2"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: "different-group-id",
                        name: "Different Group",
                        createdBy: "other-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            await expect(usecase.exec(userId, groupId, data)).rejects.toThrow(
                "User cannot access this group",
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.addUsersToGroup).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when user is contributor", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userIds: ["new-user-1", "new-user-2"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "owner-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Contributor,
                },
            ]);

            await expect(usecase.exec(userId, groupId, data)).rejects.toThrow(
                "User must be owner or admin to add users to group",
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.addUsersToGroup).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when user has no groups", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userIds: ["new-user-1", "new-user-2"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

            await expect(usecase.exec(userId, groupId, data)).rejects.toThrow(
                "User cannot access this group",
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.addUsersToGroup).not.toHaveBeenCalled();
        });

        it("should add single user to group", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userIds: ["new-user-1"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.addUsersToGroup).toHaveBeenCalledWith(
                ["new-user-1"],
                groupId,
                UserGroupRole.Contributor,
            );
        });

        it("should add multiple users to group", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userIds: ["user-1", "user-2", "user-3", "user-4"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.addUsersToGroup).toHaveBeenCalledWith(
                data.userIds,
                groupId,
                UserGroupRole.Contributor,
            );
        });

        it("should verify added users get contributor role", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userIds: ["new-user-1", "new-user-2"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            const addUsersToGroupCalls =
                mockGroupRepository.addUsersToGroup.mock.calls;
            expect(addUsersToGroupCalls.length).toBe(1);
            expect(addUsersToGroupCalls[0][2]).toBe(UserGroupRole.Contributor);
        });
    });
});
