import { MapPointType, UserGroupRole } from "../../../src/core/commons/enums";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import { MapPointEntity } from "../../../src/core/entities/MapPointEntity";
import GetMapPoints from "../../../src/core/usecases/GetMapPoints";

const mockMapPointRepository: jest.Mocked<MapRepository> = {
    createMapPoint: jest.fn(),
    findAllMapPoints: jest.fn(),
    findMapPointById: jest.fn(),
    findMapByGroupId: jest.fn(),
    createMap: jest.fn(),
};

const mockGroupRepository: jest.Mocked<GroupRepository> = {
    findByUserId: jest.fn(),
    createGroup: jest.fn(),
    addUserToGroup: jest.fn(),
};

describe("GetMapPoints", () => {
    let getMapPoints: GetMapPoints;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");
    const userId = "user-id-123";
    const groupId = "group-id-456";
    const mapId = "map-id-789";

    beforeEach(() => {
        jest.clearAllMocks();
        getMapPoints = new GetMapPoints(
            mockGroupRepository,
            mockMapPointRepository,
        );
    });

    describe("exec", () => {
        it("should return all map points", async () => {
            const mockMapPoints: MapPointEntity[] = [
                {
                    id: 1,
                    long: 45.0,
                    lat: 9.0,
                    type: MapPointType.Theft,
                    date: "2025-10-02",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
                {
                    id: 2,
                    long: 46.0,
                    lat: 10.0,
                    type: MapPointType.Aggression,
                    date: "2023-01-02",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockGroupRepository.findByUserId.mockResolvedValue([
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

            mockMapPointRepository.findMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                },
            ]);

            mockMapPointRepository.findAllMapPoints.mockResolvedValue(
                mockMapPoints,
            );

            const result = await getMapPoints.exec(userId, groupId, mapId);

            expect(result).toEqual([
                {
                    id: 1,
                    long: 45.0,
                    lat: 9.0,
                    type: MapPointType.Theft,
                    date: "2025-10-02",
                    createdAt: mockDate,
                },
                {
                    id: 2,
                    long: 46.0,
                    lat: 10.0,
                    type: MapPointType.Aggression,
                    date: "2023-01-02",
                    createdAt: mockDate,
                },
            ]);
            expect(mockGroupRepository.findByUserId).toHaveBeenCalledWith(
                userId,
            );
            expect(
                mockMapPointRepository.findMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(
                mockMapPointRepository.findAllMapPoints,
            ).toHaveBeenCalledWith(mapId);
            expect(
                mockMapPointRepository.findAllMapPoints,
            ).toHaveBeenCalledTimes(1);
        });

        it("should return empty array when no map points exist", async () => {
            mockGroupRepository.findByUserId.mockResolvedValue([
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

            mockMapPointRepository.findMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                },
            ]);

            mockMapPointRepository.findAllMapPoints.mockResolvedValue([]);

            const result = await getMapPoints.exec(userId, groupId, mapId);

            expect(result).toEqual([]);
            expect(mockGroupRepository.findByUserId).toHaveBeenCalledWith(
                userId,
            );
            expect(
                mockMapPointRepository.findMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(
                mockMapPointRepository.findAllMapPoints,
            ).toHaveBeenCalledWith(mapId);
            expect(
                mockMapPointRepository.findAllMapPoints,
            ).toHaveBeenCalledTimes(1);
        });
    });
});
