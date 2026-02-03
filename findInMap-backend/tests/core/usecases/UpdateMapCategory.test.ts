import UpdateMapCategory from "../../../src/core/usecases/UpdateMapCategory";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import { UserGroupRole } from "../../../src/core/commons/enums";

describe("UpdateMapCategory", () => {
    const mockGroupRepository: jest.Mocked<GroupRepository> = {
        createGroup: jest.fn(),
        findByUserId: jest.fn(),
        memoizedFindByUserId: jest.fn(),
        addUsersToGroup: jest.fn(),
        findUsersByGroupId: jest.fn(),
        removeUserFromGroup: jest.fn(),
        updateUserInGroup: jest.fn(),
        updateGroup: jest.fn(),
        addUserToGroup: jest.fn(),
    };

    const mockMapRepository: jest.Mocked<MapRepository> = {
        findMapByPublicId: jest.fn(),
        createMapPoint: jest.fn(),
        deleteMapPoints: jest.fn(),
        findAllMapPoints: jest.fn(),
        findMapPointById: jest.fn(),
        findMapByGroupId: jest.fn(),
        memoizedFindMapByGroupId: jest.fn(),
        createMap: jest.fn(),
        createCategory: jest.fn(),
        findCategoriesByMapId: jest.fn(),
        updateMapPoint: jest.fn(),
        updateMap: jest.fn(),
        deleteMap: jest.fn(),
        deleteMapCategory: jest.fn(),
        updateCategory: jest.fn(),
        invalidateMapsCache: jest.fn(),
        createMapPoints: jest.fn(),
        memoizedFindCategoriesByMapId: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update category when user has access", async () => {
        const userId = "user-123";
        const groupId = "group-123";
        const mapId = "map-123";
        const categoryId = "category-123";
        const updateData = {
            description: "Updated Description",
            color: "#00FF00",
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

        mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
            {
                id: mapId,
                name: "Test Map",
                groupId,
                isPublic: false,
                publicId: null,
            },
        ]);

        mockMapRepository.updateCategory.mockResolvedValue({
            id: categoryId,
            map_id: mapId,
            description: "Updated Description",
            color: "#00FF00",
            created_at: new Date(),
            updated_at: new Date(),
        });

        const usecase = new UpdateMapCategory(
            mockGroupRepository,
            mockMapRepository,
        );

        const result = await usecase.exec(
            userId,
            groupId,
            mapId,
            categoryId,
            updateData,
        );

        expect(result).toEqual({
            id: categoryId,
            description: "Updated Description",
            color: "#00FF00",
        });
        expect(mockMapRepository.updateCategory).toHaveBeenCalledWith(
            mapId,
            categoryId,
            updateData,
        );
    });

    it("should throw NotAllowedActionError when user cannot access group", async () => {
        const userId = "user-123";
        const groupId = "group-123";
        const mapId = "map-123";
        const categoryId = "category-123";
        const updateData = { description: "Updated", color: "#00FF00" };

        mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

        const usecase = new UpdateMapCategory(
            mockGroupRepository,
            mockMapRepository,
        );

        await expect(
            usecase.exec(userId, groupId, mapId, categoryId, updateData),
        ).rejects.toThrow(NotAllowedActionError);

        expect(mockMapRepository.updateCategory).not.toHaveBeenCalled();
    });

    it("should throw NotAllowedActionError when map not in group", async () => {
        const userId = "user-123";
        const groupId = "group-123";
        const mapId = "map-123";
        const categoryId = "category-123";
        const updateData = { description: "Updated", color: "#00FF00" };

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

        mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
            {
                id: "other-map",
                name: "Other Map",
                groupId,
                isPublic: false,
                publicId: null,
            },
        ]);

        const usecase = new UpdateMapCategory(
            mockGroupRepository,
            mockMapRepository,
        );

        await expect(
            usecase.exec(userId, groupId, mapId, categoryId, updateData),
        ).rejects.toThrow(NotAllowedActionError);

        expect(mockMapRepository.updateCategory).not.toHaveBeenCalled();
    });

    it("should allow contributor to update category", async () => {
        const userId = "user-123";
        const groupId = "group-123";
        const mapId = "map-123";
        const categoryId = "category-123";
        const updateData = {
            description: "Updated by Contributor",
            color: "#0000FF",
        };

        mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
            {
                group: {
                    id: groupId,
                    name: "Test Group",
                    createdBy: "other-user",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                role: UserGroupRole.Contributor,
            },
        ]);

        mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
            {
                id: mapId,
                name: "Test Map",
                groupId,
                isPublic: false,
                publicId: null,
            },
        ]);

        mockMapRepository.updateCategory.mockResolvedValue({
            id: categoryId,
            map_id: mapId,
            description: "Updated by Contributor",
            color: "#0000FF",
            created_at: new Date(),
            updated_at: new Date(),
        });

        const usecase = new UpdateMapCategory(
            mockGroupRepository,
            mockMapRepository,
        );

        const result = await usecase.exec(
            userId,
            groupId,
            mapId,
            categoryId,
            updateData,
        );

        expect(result).toEqual({
            id: categoryId,
            description: "Updated by Contributor",
            color: "#0000FF",
        });
    });
});
