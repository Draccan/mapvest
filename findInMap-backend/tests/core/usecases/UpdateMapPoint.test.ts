import { UserGroupRole } from "../../../src/core/commons/enums";
import { UpdateMapPointDto } from "../../../src/core/dtos/UpdateMapPointDto";
import { MapPointEntity } from "../../../src/core/entities/MapPointEntity";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import UpdateMapPoint from "../../../src/core/usecases/UpdateMapPoint";
import { mockGroupRepository, mockMapRepository } from "../../helpers";

describe("UpdateMapPoint", () => {
    let updateMapPoint: UpdateMapPoint;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");
    const userId = "user-id-123";
    const groupId = "group-id-456";
    const mapId = "map-id-789";
    const pointId = "point-id-101";

    beforeEach(() => {
        jest.clearAllMocks();
        updateMapPoint = new UpdateMapPoint(
            mockGroupRepository,
            mockMapRepository,
        );
    });

    describe("exec", () => {
        it("should successfully update a map point", async () => {
            const updateData: UpdateMapPointDto = {
                description: "Updated Theft",
                date: "2025-10-15",
            };

            const updatedPoint: MapPointEntity = {
                id: pointId,
                long: 45.0,
                lat: 9.0,
                description: updateData.description!,
                date: updateData.date,
                created_at: mockDate,
                updated_at: new Date("2025-10-15T00:00:00.000Z"),
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
                    isPublic: false,
                    publicId: null,
                },
            ]);

            mockMapRepository.updateMapPoint.mockResolvedValue(updatedPoint);

            const result = await updateMapPoint.exec(
                pointId,
                updateData,
                userId,
                groupId,
                mapId,
            );

            expect(result).toEqual({
                id: pointId,
                long: 45.0,
                lat: 9.0,
                description: "Updated Theft",
                date: "2025-10-15",
                createdAt: mockDate,
            });
            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.updateMapPoint).toHaveBeenCalledWith(
                pointId,
                mapId,
                updateData,
            );
        });

        it("should throw NotAllowedActionError if user cannot access group", async () => {
            const updateData: UpdateMapPointDto = {
                description: "Updated Theft",
                date: "2025-10-15",
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: "different-group-id",
                        name: "Different Group",
                        createdBy: "other-user-id",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            await expect(
                updateMapPoint.exec(
                    pointId,
                    updateData,
                    userId,
                    groupId,
                    mapId,
                ),
            ).rejects.toThrow(NotAllowedActionError);
        });

        it("should throw NotAllowedActionError if map does not belong to group", async () => {
            const updateData: UpdateMapPointDto = {
                description: "Updated Theft",
                date: "2025-10-15",
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
                    isPublic: false,
                    publicId: null,
                },
            ]);

            await expect(
                updateMapPoint.exec(
                    pointId,
                    updateData,
                    userId,
                    groupId,
                    mapId,
                ),
            ).rejects.toThrow(NotAllowedActionError);
        });

        it("should throw Error if map point does not exist", async () => {
            const updateData: UpdateMapPointDto = {
                description: "Updated Theft",
                date: "2025-10-15",
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
                    isPublic: false,
                    publicId: null,
                },
            ]);

            mockMapRepository.updateMapPoint.mockResolvedValue(null);

            await expect(
                updateMapPoint.exec(
                    pointId,
                    updateData,
                    userId,
                    groupId,
                    mapId,
                ),
            ).rejects.toThrow(Error);
        });

        it("should throw Error if point belongs to different map", async () => {
            const updateData: UpdateMapPointDto = {
                description: "Updated Theft",
                date: "2025-10-15",
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
                    isPublic: false,
                    publicId: null,
                },
            ]);

            // Il repository restituisce null quando il punto non appartiene alla mappa
            mockMapRepository.updateMapPoint.mockResolvedValue(null);

            await expect(
                updateMapPoint.exec(
                    pointId,
                    updateData,
                    userId,
                    groupId,
                    mapId,
                ),
            ).rejects.toThrow(Error);
        });

        it("should update with category", async () => {
            const updateData: UpdateMapPointDto = {
                description: "Updated Theft",
                date: "2025-10-15",
                categoryId: "category-id-123",
            };

            const updatedPoint: MapPointEntity = {
                id: pointId,
                long: 45.0,
                lat: 9.0,
                description: updateData.description!,
                date: updateData.date,
                category_id: updateData.categoryId,
                created_at: mockDate,
                updated_at: new Date("2025-10-15T00:00:00.000Z"),
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
                    isPublic: false,
                    publicId: null,
                },
            ]);

            mockMapRepository.updateMapPoint.mockResolvedValue(updatedPoint);

            const result = await updateMapPoint.exec(
                pointId,
                updateData,
                userId,
                groupId,
                mapId,
            );

            expect(result.categoryId).toBe("category-id-123");
        });

        it("should update with notes", async () => {
            const updateData: UpdateMapPointDto = {
                description: "Updated Theft",
                date: "2025-10-15",
                notes: "These are detailed notes about this map point",
            };

            const updatedPoint: MapPointEntity = {
                id: pointId,
                long: 45.0,
                lat: 9.0,
                description: updateData.description!,
                date: updateData.date,
                notes: updateData.notes,
                created_at: mockDate,
                updated_at: new Date("2025-10-15T00:00:00.000Z"),
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
                    isPublic: false,
                    publicId: null,
                },
            ]);

            mockMapRepository.updateMapPoint.mockResolvedValue(updatedPoint);

            const result = await updateMapPoint.exec(
                pointId,
                updateData,
                userId,
                groupId,
                mapId,
            );

            expect(result.notes).toBe(
                "These are detailed notes about this map point",
            );
        });
    });
});
