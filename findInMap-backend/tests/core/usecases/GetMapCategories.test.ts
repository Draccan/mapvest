import { UserGroupRole } from "../../../src/core/commons/enums";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import GetMapCategories from "../../../src/core/usecases/GetMapCategories";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";

const mockGroupRepository: jest.Mocked<GroupRepository> = {
    findByUserId: jest.fn(),
    memoizedFindByUserId: jest.fn(),
    createGroup: jest.fn(),
    addUserToGroup: jest.fn(),
};

const mockMapRepository: jest.Mocked<MapRepository> = {
    findAllMapPoints: jest.fn(),
    findMapByGroupId: jest.fn(),
    createMapPoint: jest.fn(),
    findMapPointById: jest.fn(),
    deleteMapPoints: jest.fn(),
    memoizedFindMapByGroupId: jest.fn(),
    createMap: jest.fn(),
    createCategory: jest.fn(),
    findCategoriesByMapId: jest.fn(),
    updateMapPoint: jest.fn(),
};

describe("GetMapCategories", () => {
    const usecase = new GetMapCategories(
        mockGroupRepository,
        mockMapRepository,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return categories when user has access to group and map exists", async () => {
        const userId = "user123";
        const groupId = "group123";
        const mapId = "map123";

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
            { id: mapId, groupId: groupId, name: "Test Map" },
        ]);

        mockMapRepository.findCategoriesByMapId.mockResolvedValue([
            {
                id: "category1",
                map_id: mapId,
                description: "Furto",
                color: "#FF0000",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: "category2",
                map_id: mapId,
                description: "Rapina",
                color: "#00FF00",
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        const result = await usecase.exec(userId, groupId, mapId);

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("category1");
        expect(result[0].description).toBe("Furto");
        expect(result[1].id).toBe("category2");
        expect(result[1].description).toBe("Rapina");
        expect(mockMapRepository.findCategoriesByMapId).toHaveBeenCalledWith(
            mapId,
        );
    });

    it("should throw NotAllowedActionError when user does not have access to group", async () => {
        const userId = "user123";
        const groupId = "group123";
        const mapId = "map123";

        mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

        await expect(usecase.exec(userId, groupId, mapId)).rejects.toThrow(
            NotAllowedActionError,
        );
    });

    it("should throw NotAllowedActionError when map does not belong to group", async () => {
        const userId = "user123";
        const groupId = "group123";
        const mapId = "map123";

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

        mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([]);

        await expect(usecase.exec(userId, groupId, mapId)).rejects.toThrow(
            NotAllowedActionError,
        );
    });

    it("should return empty array when no categories exist", async () => {
        const userId = "user123";
        const groupId = "group123";
        const mapId = "map123";

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
            { id: mapId, groupId: groupId, name: "Test Map" },
        ]);

        mockMapRepository.findCategoriesByMapId.mockResolvedValue([]);

        const result = await usecase.exec(userId, groupId, mapId);

        expect(result).toHaveLength(0);
    });
});
