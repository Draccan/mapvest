import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import CreateMapDto from "../../../src/core/dtos/CreateMapDto";
import DetailedGroupEntity from "../../../src/core/entities/DetailedGroupEntity";
import MapEntity from "../../../src/core/entities/MapEntity";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import CreateGroupMap from "../../../src/core/usecases/CreateGroupMap";
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
};

describe("CreateGroupMap", () => {
    let createGroupMap: CreateGroupMap;
    const mockDate = new Date("2025-10-29T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        createGroupMap = new CreateGroupMap(
            mockMapRepository,
            mockGroupRepository,
        );
    });

    describe("execute", () => {
        it("should successfully create a map for a group the user has access to", async () => {
            const userId = "user-123";
            const groupId = "group-1";
            const createMapDto: CreateMapDto = {
                name: "New Map",
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

            const mockCreatedMap: MapEntity = {
                id: "map-123",
                groupId: groupId,
                name: "New Map",
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.createMap.mockResolvedValue(mockCreatedMap);

            const result = await createGroupMap.execute(
                groupId,
                userId,
                createMapDto,
            );

            expect(result).toEqual({
                id: "map-123",
                name: "New Map",
            });
            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockMapRepository.createMap).toHaveBeenCalledWith(
                groupId,
                createMapDto,
            );
        });

        it("should throw NotAllowedActionError when user does not have access to the group", async () => {
            const userId = "user-123";
            const requestedGroupId = "group-2";
            const createMapDto: CreateMapDto = {
                name: "New Map",
            };

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "My Group",
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
                createGroupMap.execute(requestedGroupId, userId, createMapDto),
            ).rejects.toThrow(NotAllowedActionError);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockMapRepository.createMap).not.toHaveBeenCalled();
        });

        it("should allow Contributor role to create maps in the group", async () => {
            const userId = "user-456";
            const groupId = "group-1";
            const createMapDto: CreateMapDto = {
                name: "Contributor Map",
            };

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "My Group",
                        createdBy: "user-123",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Contributor,
                },
            ];

            const mockCreatedMap: MapEntity = {
                id: "map-456",
                groupId: groupId,
                name: "Contributor Map",
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.createMap.mockResolvedValue(mockCreatedMap);

            const result = await createGroupMap.execute(
                groupId,
                userId,
                createMapDto,
            );

            expect(result).toEqual({
                id: "map-456",
                name: "Contributor Map",
            });
            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockMapRepository.createMap).toHaveBeenCalledWith(
                groupId,
                createMapDto,
            );
        });

        it("should handle empty user groups list", async () => {
            const userId = "user-123";
            const groupId = "group-1";
            const createMapDto: CreateMapDto = {
                name: "New Map",
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

            await expect(
                createGroupMap.execute(groupId, userId, createMapDto),
            ).rejects.toThrow(NotAllowedActionError);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockMapRepository.createMap).not.toHaveBeenCalled();
        });
    });
});
