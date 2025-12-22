import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import UpdateMapDto from "../../../src/core/dtos/UpdateMapDto";
import DetailedGroupEntity from "../../../src/core/entities/DetailedGroupEntity";
import MapEntity from "../../../src/core/entities/MapEntity";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import UpdateMap from "../../../src/core/usecases/UpdateMap";
import { UserGroupRole } from "../../../src/core/commons/enums";

const mockMapRepository: jest.Mocked<MapRepository> = {
    deleteMapPoints: jest.fn(),
    findAllMapPoints: jest.fn(),
    findMapByGroupId: jest.fn(),
    createMapPoint: jest.fn(),
    findMapPointById: jest.fn(),
    createMap: jest.fn(),
    memoizedFindMapByGroupId: jest.fn(),
    createCategory: jest.fn(),
    findCategoriesByMapId: jest.fn(),
    updateMapPoint: jest.fn(),
    updateMap: jest.fn(),
};

const mockGroupRepository: jest.Mocked<GroupRepository> = {
    findByUserId: jest.fn(),
    createGroup: jest.fn(),
    addUserToGroup: jest.fn(),
    memoizedFindByUserId: jest.fn(),
    updateGroup: jest.fn(),
};

describe("UpdateMap", () => {
    let updateMap: UpdateMap;
    const mockDate = new Date("2025-10-29T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        updateMap = new UpdateMap(mockMapRepository, mockGroupRepository);
    });

    describe("execute", () => {
        it("should successfully update a map the user has access to", async () => {
            const userId = "user-123";
            const groupId = "group-1";
            const mapId = "map-123";
            const updateMapDto: UpdateMapDto = {
                name: "Updated Map Name",
            };

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "My Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            const mockMaps: MapEntity[] = [
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Original Map Name",
                },
            ];

            const mockUpdatedMap: MapEntity = {
                id: mapId,
                groupId: groupId,
                name: "Updated Map Name",
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue(
                mockMaps,
            );
            mockMapRepository.updateMap.mockResolvedValue(mockUpdatedMap);

            const result = await updateMap.execute(
                mapId,
                groupId,
                userId,
                updateMapDto,
            );

            expect(result).toEqual({
                id: mapId,
                name: "Updated Map Name",
            });
            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.updateMap).toHaveBeenCalledWith(
                mapId,
                groupId,
                updateMapDto,
            );
        });

        it("should throw NotAllowedActionError when user does not have access to the group", async () => {
            const userId = "user-123";
            const requestedGroupId = "group-2";
            const mapId = "map-123";
            const updateMapDto: UpdateMapDto = {
                name: "Updated Map Name",
            };

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "User's Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );

            await expect(
                updateMap.execute(
                    mapId,
                    requestedGroupId,
                    userId,
                    updateMapDto,
                ),
            ).rejects.toThrow(NotAllowedActionError);
            await expect(
                updateMap.execute(
                    mapId,
                    requestedGroupId,
                    userId,
                    updateMapDto,
                ),
            ).rejects.toThrow("User cannot access map for this group");

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).not.toHaveBeenCalled();
            expect(mockMapRepository.updateMap).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when map does not belong to the group", async () => {
            const userId = "user-123";
            const groupId = "group-1";
            const requestedMapId = "map-999";
            const updateMapDto: UpdateMapDto = {
                name: "Updated Map Name",
            };

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "My Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            const mockMaps: MapEntity[] = [
                {
                    id: "map-123",
                    groupId: groupId,
                    name: "First Map",
                },
                {
                    id: "map-456",
                    groupId: groupId,
                    name: "Second Map",
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue(
                mockMaps,
            );

            await expect(
                updateMap.execute(
                    requestedMapId,
                    groupId,
                    userId,
                    updateMapDto,
                ),
            ).rejects.toThrow(NotAllowedActionError);
            await expect(
                updateMap.execute(
                    requestedMapId,
                    groupId,
                    userId,
                    updateMapDto,
                ),
            ).rejects.toThrow("This group has no access to the specified map");

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.updateMap).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when map update returns null", async () => {
            const userId = "user-123";
            const groupId = "group-1";
            const mapId = "map-123";
            const updateMapDto: UpdateMapDto = {
                name: "Updated Map Name",
            };

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "My Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            const mockMaps: MapEntity[] = [
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Original Map Name",
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue(
                mockMaps,
            );
            mockMapRepository.updateMap.mockResolvedValue(null);

            await expect(
                updateMap.execute(mapId, groupId, userId, updateMapDto),
            ).rejects.toThrow(NotAllowedActionError);
            await expect(
                updateMap.execute(mapId, groupId, userId, updateMapDto),
            ).rejects.toThrow("Map not found");

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.updateMap).toHaveBeenCalledWith(
                mapId,
                groupId,
                updateMapDto,
            );
        });

        it("should work with different user group roles", async () => {
            const userId = "user-123";
            const groupId = "group-1";
            const mapId = "map-123";
            const updateMapDto: UpdateMapDto = {
                name: "Updated Map Name",
            };

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "My Group",
                        createdBy: "other-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Contributor,
                },
            ];

            const mockMaps: MapEntity[] = [
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Original Map Name",
                },
            ];

            const mockUpdatedMap: MapEntity = {
                id: mapId,
                groupId: groupId,
                name: "Updated Map Name",
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue(
                mockMaps,
            );
            mockMapRepository.updateMap.mockResolvedValue(mockUpdatedMap);

            const result = await updateMap.execute(
                mapId,
                groupId,
                userId,
                updateMapDto,
            );

            expect(result).toEqual({
                id: mapId,
                name: "Updated Map Name",
            });
            expect(mockMapRepository.updateMap).toHaveBeenCalledWith(
                mapId,
                groupId,
                updateMapDto,
            );
        });
    });
});
