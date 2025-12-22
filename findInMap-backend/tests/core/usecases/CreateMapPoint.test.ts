import { UserGroupRole } from "../../../src/core/commons/enums";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import { CreateMapPointDto } from "../../../src/core/dtos/CreateMapPointDto";
import { MapPointEntity } from "../../../src/core/entities/MapPointEntity";
import CreateMapPoint from "../../../src/core/usecases/CreateMapPoint";

const mockMapRepository: jest.Mocked<MapRepository> = {
    deleteMapPoints: jest.fn(),
    createMapPoint: jest.fn(),
    findAllMapPoints: jest.fn(),
    findMapPointById: jest.fn(),
    findMapByGroupId: jest.fn(),
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

describe("CreateMapPoint", () => {
    let createMapPoint: CreateMapPoint;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");
    const userId = "user-id-123";
    const groupId = "group-id-456";
    const mapId = "map-id-789";

    beforeEach(() => {
        jest.clearAllMocks();
        createMapPoint = new CreateMapPoint(
            mockGroupRepository,
            mockMapRepository,
        );
    });

    describe("exec", () => {
        it("should successfully create a map point", async () => {
            const mapPointData: CreateMapPointDto = {
                long: 45.0,
                lat: 9.0,
                description: "Theft",
                date: "2025-10-02",
            };

            const mockCreatedMapPoint: MapPointEntity = {
                id: "1",
                long: mapPointData.long,
                lat: mapPointData.lat,
                description: mapPointData.description,
                date: mapPointData.date,
                created_at: mockDate,
                updated_at: mockDate,
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

            mockMapRepository.createMapPoint.mockResolvedValue(
                mockCreatedMapPoint,
            );

            const result = await createMapPoint.exec(
                mapPointData,
                userId,
                groupId,
                mapId,
            );

            expect(result).toEqual({
                id: "1",
                long: 45.0,
                lat: 9.0,
                description: "Theft",
                date: "2025-10-02",
                createdAt: mockDate,
            });
            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.createMapPoint).toHaveBeenCalledWith(
                mapPointData,
                mapId,
            );
        });
    });
});
