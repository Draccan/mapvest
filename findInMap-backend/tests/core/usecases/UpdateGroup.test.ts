import { UserGroupRole } from "../../../src/core/commons/enums";
import UpdateGroup from "../../../src/core/usecases/UpdateGroup";
import { mockGroupRepository } from "../../helpers";

describe("UpdateGroup", () => {
    const usecase = new UpdateGroup(mockGroupRepository);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("exec", () => {
        it("should update group name successfully when user has access", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = { name: "Updated Group Name" };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Original Name",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockGroupRepository.updateGroup.mockResolvedValue({
                id: groupId,
                name: "Updated Group Name",
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                planName: null,
                planEndDate: null,
            });

            const result = await usecase.exec(userId, groupId, data);

            expect(result).toBeDefined();
            expect(result.name).toBe("Updated Group Name");
            expect(result.plan).toBe("free");
            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.updateGroup).toHaveBeenCalledWith(
                groupId,
                userId,
                data,
            );
        });

        it("should throw NotAllowedActionError when user does not have access to group", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = { name: "Updated Group Name" };

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
                    role: UserGroupRole.Contributor,
                },
            ]);

            await expect(usecase.exec(userId, groupId, data)).rejects.toThrow(
                "User cannot access this group",
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.updateGroup).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when updateGroup returns null", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = { name: "Updated Group Name" };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Original Name",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockGroupRepository.updateGroup.mockResolvedValue(null);

            await expect(usecase.exec(userId, groupId, data)).rejects.toThrow(
                "Group not found or access denied",
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.updateGroup).toHaveBeenCalledWith(
                groupId,
                userId,
                data,
            );
        });

        it("should update group successfully for user with Admin role", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = { name: "New Name by Admin" };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Original Name",
                        createdBy: "other-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockGroupRepository.updateGroup.mockResolvedValue({
                id: groupId,
                name: "New Name by Admin",
                createdBy: "other-user",
                createdAt: new Date(),
                updatedAt: new Date(),
                planName: null,
                planEndDate: null,
            });

            const result = await usecase.exec(userId, groupId, data);

            expect(result).toBeDefined();
            expect(result.name).toBe("New Name by Admin");
        });

        it("should update group successfully for user with Contributor role", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = { name: "New Name by Contributor" };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Original Name",
                        createdBy: "other-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Contributor,
                },
            ]);

            mockGroupRepository.updateGroup.mockResolvedValue({
                id: groupId,
                name: "New Name by Contributor",
                createdBy: "other-user",
                createdAt: new Date(),
                updatedAt: new Date(),
                planName: null,
                planEndDate: null,
            });

            const result = await usecase.exec(userId, groupId, data);

            expect(result).toBeDefined();
            expect(result.name).toBe("New Name by Contributor");
        });
    });
});
