import { UserGroupRole } from "../../../src/core/commons/enums";
import RemoveUserFromGroup from "../../../src/core/usecases/RemoveUserFromGroup";
import { mockGroupRepository } from "../../helpers";

describe("RemoveUserFromGroup", () => {
    const usecase = new RemoveUserFromGroup(mockGroupRepository);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("exec", () => {
        it("should remove user from group successfully when user is owner", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const userIdToRemove = "user-to-remove";

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockGroupRepository.removeUserFromGroup.mockResolvedValue(
                undefined,
            );

            await usecase.exec(userId, groupId, userIdToRemove);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockGroupRepository.removeUserFromGroup,
            ).toHaveBeenCalledWith(userIdToRemove, groupId);
        });

        it("should remove user from group successfully when user is admin", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const userIdToRemove = "user-to-remove";

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "owner-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockGroupRepository.removeUserFromGroup.mockResolvedValue(
                undefined,
            );

            await usecase.exec(userId, groupId, userIdToRemove);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockGroupRepository.removeUserFromGroup,
            ).toHaveBeenCalledWith(userIdToRemove, groupId);
        });

        it("should throw NotAllowedActionError when user does not have access to group", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const userIdToRemove = "user-to-remove";

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: "different-group-id",
                        name: "Different Group",
                        createdBy: "other-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            await expect(
                usecase.exec(userId, groupId, userIdToRemove),
            ).rejects.toThrow("User cannot access this group");

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockGroupRepository.removeUserFromGroup,
            ).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when user is contributor", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const userIdToRemove = "user-to-remove";

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "owner-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Contributor,
                },
            ]);

            await expect(
                usecase.exec(userId, groupId, userIdToRemove),
            ).rejects.toThrow(
                "User must be owner or admin to remove users from group",
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockGroupRepository.removeUserFromGroup,
            ).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when user has no groups", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const userIdToRemove = "user-to-remove";

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

            await expect(
                usecase.exec(userId, groupId, userIdToRemove),
            ).rejects.toThrow("User cannot access this group");

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockGroupRepository.removeUserFromGroup,
            ).not.toHaveBeenCalled();
        });

        it("should allow owner to remove admin", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const userIdToRemove = "admin-to-remove";

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockGroupRepository.removeUserFromGroup.mockResolvedValue(
                undefined,
            );

            await usecase.exec(userId, groupId, userIdToRemove);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockGroupRepository.removeUserFromGroup,
            ).toHaveBeenCalledWith(userIdToRemove, groupId);
        });

        it("should allow admin to remove contributor", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const userIdToRemove = "contributor-to-remove";

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "owner-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockGroupRepository.removeUserFromGroup.mockResolvedValue(
                undefined,
            );

            await usecase.exec(userId, groupId, userIdToRemove);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockGroupRepository.removeUserFromGroup,
            ).toHaveBeenCalledWith(userIdToRemove, groupId);
        });

        it("should remove user even if user does not exist in group", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const userIdToRemove = "non-existent-user";

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockGroupRepository.removeUserFromGroup.mockResolvedValue(
                undefined,
            );

            await usecase.exec(userId, groupId, userIdToRemove);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockGroupRepository.removeUserFromGroup,
            ).toHaveBeenCalledWith(userIdToRemove, groupId);
        });
    });
});
