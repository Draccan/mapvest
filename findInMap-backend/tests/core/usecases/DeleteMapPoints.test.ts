import { UserGroupRole } from "../../../src/core/commons/enums";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import { DeleteMapPointsDto } from "../../../src/core/dtos/DeleteMapPointsDto";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import DeleteMapPoints from "../../../src/core/usecases/DeleteMapPoints";

const mockMapRepository: jest.Mocked<MapRepository> = {
    createMapPoint: jest.fn(),
    deleteMapPoints: jest.fn(),
    findAllMapPoints: jest.fn(),
    findMapPointById: jest.fn(),
    findMapByGroupId: jest.fn(),
    createMap: jest.fn(),
    memoizedFindMapByGroupId: jest.fn(),
    createCategory: jest.fn(),
    findCategoriesByMapId: jest.fn(),
};

const mockGroupRepository: jest.Mocked<GroupRepository> = {
    findByUserId: jest.fn(),
    createGroup: jest.fn(),
    addUserToGroup: jest.fn(),
    memoizedFindByUserId: jest.fn(),
};

describe("DeleteMapPoints", () => {
    let deleteMapPoints: DeleteMapPoints;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");
    const userId = "user-id-123";
    const groupId = "group-id-456";
    const mapId = "map-id-789";

    beforeEach(() => {
        jest.clearAllMocks();
        deleteMapPoints = new DeleteMapPoints(
            mockGroupRepository,
            mockMapRepository,
        );
    });

    describe("exec", () => {
        it("should successfully delete map points", async () => {
            const deleteData: DeleteMapPointsDto = {
                pointIds: ["1", "2", "3"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                },
            ]);

            mockMapRepository.deleteMapPoints.mockResolvedValue(undefined);

            await deleteMapPoints.exec(deleteData, userId, groupId, mapId);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.deleteMapPoints).toHaveBeenCalledWith(
                mapId,
                ["1", "2", "3"],
            );
        });

        it("should throw NotAllowedActionError when user has no access to group", async () => {
            const deleteData: DeleteMapPointsDto = {
                pointIds: ["1", "2"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: "different-group-id",
                        name: "Different Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            await expect(
                deleteMapPoints.exec(deleteData, userId, groupId, mapId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).not.toHaveBeenCalled();
            expect(mockMapRepository.deleteMapPoints).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when map does not belong to group", async () => {
            const deleteData: DeleteMapPointsDto = {
                pointIds: ["1", "2"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: "different-map-id",
                    groupId: groupId,
                    name: "Different Map",
                },
            ]);

            await expect(
                deleteMapPoints.exec(deleteData, userId, groupId, mapId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.deleteMapPoints).not.toHaveBeenCalled();
        });

        it("should handle empty pointIds array", async () => {
            const deleteData: DeleteMapPointsDto = {
                pointIds: [],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                },
            ]);

            mockMapRepository.deleteMapPoints.mockResolvedValue(undefined);

            await deleteMapPoints.exec(deleteData, userId, groupId, mapId);

            expect(mockMapRepository.deleteMapPoints).toHaveBeenCalledWith(
                mapId,
                [],
            );
        });
    });
});
