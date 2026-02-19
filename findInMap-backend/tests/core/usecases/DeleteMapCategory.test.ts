import { UserGroupRole } from "../../../src/core/commons/enums";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import DeleteMapCategory from "../../../src/core/usecases/DeleteMapCategory";
import { mockGroupRepository, mockMapRepository } from "../../helpers";

describe("DeleteMapCategory", () => {
    let deleteMapCategory: DeleteMapCategory;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");
    const userId = "user-id-123";
    const groupId = "group-id-456";
    const mapId = "map-id-789";
    const categoryId = "category-id-abc";

    beforeEach(() => {
        jest.clearAllMocks();
        deleteMapCategory = new DeleteMapCategory(
            mockGroupRepository,
            mockMapRepository,
        );
    });

    describe("exec", () => {
        it("should successfully delete category when user has access to group and map", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                    isPublic: false,
                    publicId: null,
                },
            ]);

            mockMapRepository.deleteMapCategory.mockResolvedValue(undefined);

            await deleteMapCategory.exec(userId, groupId, mapId, categoryId);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.deleteMapCategory).toHaveBeenCalledWith(
                mapId,
                categoryId,
            );
        });

        it("should allow contributor to delete category", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "other-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Contributor,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                    isPublic: false,
                    publicId: null,
                },
            ]);

            mockMapRepository.deleteMapCategory.mockResolvedValue(undefined);

            await deleteMapCategory.exec(userId, groupId, mapId, categoryId);

            expect(mockMapRepository.deleteMapCategory).toHaveBeenCalledWith(
                mapId,
                categoryId,
            );
        });

        it("should allow admin to delete category", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "other-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                    isPublic: false,
                    publicId: null,
                },
            ]);

            mockMapRepository.deleteMapCategory.mockResolvedValue(undefined);

            await deleteMapCategory.exec(userId, groupId, mapId, categoryId);

            expect(mockMapRepository.deleteMapCategory).toHaveBeenCalledWith(
                mapId,
                categoryId,
            );
        });

        it("should throw NotAllowedActionError when user has no access to group", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: "different-group-id",
                        name: "Different Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            await expect(
                deleteMapCategory.exec(userId, groupId, mapId, categoryId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).not.toHaveBeenCalled();
            expect(mockMapRepository.deleteMapCategory).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when map does not belong to group", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: "different-map-id",
                    groupId: groupId,
                    name: "Different Map",
                    isPublic: false,
                    publicId: null,
                },
            ]);

            await expect(
                deleteMapCategory.exec(userId, groupId, mapId, categoryId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.deleteMapCategory).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when user has no groups", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

            await expect(
                deleteMapCategory.exec(userId, groupId, mapId, categoryId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(mockMapRepository.deleteMapCategory).not.toHaveBeenCalled();
        });
    });
});
