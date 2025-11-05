import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import DetailedGroupEntity from "../../../src/core/entities/DetailedGroupEntity";
import MapEntity from "../../../src/core/entities/MapEntity";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import GetGroupMaps from "../../../src/core/usecases/GetGroupMaps";
import { UserGroupRole } from "../../../src/core/commons/enums";

const mockMapRepository: jest.Mocked<MapRepository> = {
    deleteMapPoints: jest.fn(),
    findAllMapPoints: jest.fn(),
    findMapByGroupId: jest.fn(),
    createMapPoint: jest.fn(),
    findMapPointById: jest.fn(),
    createMap: jest.fn(),
    memoizedFindMapByGroupId: jest.fn(),
};

const mockGroupRepository: jest.Mocked<GroupRepository> = {
    findByUserId: jest.fn(),
    createGroup: jest.fn(),
    addUserToGroup: jest.fn(),
    memoizedFindByUserId: jest.fn(),
};

describe("GetGroupMaps", () => {
    let getGroupMaps: GetGroupMaps;
    const mockDate = new Date("2025-10-29T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        getGroupMaps = new GetGroupMaps(mockMapRepository, mockGroupRepository);
    });

    describe("execute", () => {
        it("should successfully retrieve maps for a group the user has access to", async () => {
            const userId = "user-123";
            const groupId = "group-1";

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
                    id: "map-1",
                    groupId: groupId,
                    name: "First Map",
                },
                {
                    id: "map-2",
                    groupId: groupId,
                    name: "Second Map",
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.findMapByGroupId.mockResolvedValue(mockMaps);

            const result = await getGroupMaps.execute(groupId, userId);

            expect(result).toEqual([
                { id: "map-1", name: "First Map" },
                { id: "map-2", name: "Second Map" },
            ]);
            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockMapRepository.findMapByGroupId).toHaveBeenCalledWith(
                groupId,
            );
        });

        it("should throw NotAllowedActionError when user does not have access to the group", async () => {
            const userId = "user-123";
            const requestedGroupId = "group-2";

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
                getGroupMaps.execute(requestedGroupId, userId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockMapRepository.findMapByGroupId).not.toHaveBeenCalled();
        });

        it("should return empty array when group has no maps", async () => {
            const userId = "user-123";
            const groupId = "group-1";

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

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.findMapByGroupId.mockResolvedValue([]);

            const result = await getGroupMaps.execute(groupId, userId);

            expect(result).toEqual([]);
            expect(mockMapRepository.findMapByGroupId).toHaveBeenCalledWith(
                groupId,
            );
        });

        it("should allow access for users with contributor role", async () => {
            const userId = "user-123";
            const groupId = "group-1";

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Shared Group",
                        createdBy: "another-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Contributor,
                },
            ];

            const mockMaps: MapEntity[] = [
                {
                    id: "map-1",
                    groupId: groupId,
                    name: "Shared Map",
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.findMapByGroupId.mockResolvedValue(mockMaps);

            const result = await getGroupMaps.execute(groupId, userId);

            expect(result).toEqual([{ id: "map-1", name: "Shared Map" }]);
            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
        });

        it("should allow access for users with admin role", async () => {
            const userId = "user-123";
            const groupId = "group-1";

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Admin Group",
                        createdBy: "another-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Admin,
                },
            ];

            const mockMaps: MapEntity[] = [
                {
                    id: "map-1",
                    groupId: groupId,
                    name: "Admin Map",
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.findMapByGroupId.mockResolvedValue(mockMaps);

            const result = await getGroupMaps.execute(groupId, userId);

            expect(result).toEqual([{ id: "map-1", name: "Admin Map" }]);
        });

        it("should work when user belongs to multiple groups", async () => {
            const userId = "user-123";
            const requestedGroupId = "group-2";

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "First Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
                {
                    group: {
                        id: requestedGroupId,
                        name: "Second Group",
                        createdBy: "another-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Contributor,
                },
            ];

            const mockMaps: MapEntity[] = [
                {
                    id: "map-1",
                    groupId: requestedGroupId,
                    name: "Second Group Map",
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockMapRepository.findMapByGroupId.mockResolvedValue(mockMaps);

            const result = await getGroupMaps.execute(requestedGroupId, userId);

            expect(result).toEqual([{ id: "map-1", name: "Second Group Map" }]);
        });
    });
});
