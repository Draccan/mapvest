import { MapPointType } from "../../../src/core/commons/enums";
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

describe("GetMapPoints", () => {
    let getMapPoints: GetMapPoints;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        getMapPoints = new GetMapPoints(mockMapPointRepository);
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

            mockMapPointRepository.findAllMapPoints.mockResolvedValue(
                mockMapPoints,
            );

            const result = await getMapPoints.exec();

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
            expect(
                mockMapPointRepository.findAllMapPoints,
            ).toHaveBeenCalledTimes(1);
        });

        it("should return empty array when no map points exist", async () => {
            mockMapPointRepository.findAllMapPoints.mockResolvedValue([]);

            const result = await getMapPoints.exec();

            expect(result).toEqual([]);
            expect(
                mockMapPointRepository.findAllMapPoints,
            ).toHaveBeenCalledTimes(1);
        });
    });
});
