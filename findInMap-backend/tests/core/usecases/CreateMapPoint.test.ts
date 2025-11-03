import { MapPointType } from "../../../src/core/commons/enums";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import { CreateMapPointDto } from "../../../src/core/dtos/CreateMapPointDto";
import { MapPointEntity } from "../../../src/core/entities/MapPointEntity";
import CreateMapPoint from "../../../src/core/usecases/CreateMapPoint";

const mockMapPointRepository: jest.Mocked<MapRepository> = {
    createMapPoint: jest.fn(),
    findAllMapPoints: jest.fn(),
    findMapPointById: jest.fn(),
    findMapByGroupId: jest.fn(),
    createMap: jest.fn(),
};

describe("CreateMapPoint", () => {
    let createMapPoint: CreateMapPoint;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        createMapPoint = new CreateMapPoint(mockMapPointRepository);
    });

    describe("exec", () => {
        it("should successfully create a map point", async () => {
            const mapPointData: CreateMapPointDto = {
                long: 45.0,
                lat: 9.0,
                type: MapPointType.Theft,
                date: "2025-10-02",
            };

            const mockCreatedMapPoint: MapPointEntity = {
                id: 1,
                long: mapPointData.long,
                lat: mapPointData.lat,
                type: mapPointData.type,
                date: mapPointData.date,
                created_at: mockDate,
                updated_at: mockDate,
            };

            mockMapPointRepository.createMapPoint.mockResolvedValue(
                mockCreatedMapPoint,
            );

            const result = await createMapPoint.exec(mapPointData);

            expect(result).toEqual({
                id: 1,
                long: 45.0,
                lat: 9.0,
                type: MapPointType.Theft,
                date: "2025-10-02",
                createdAt: mockDate,
            });
            expect(mockMapPointRepository.createMapPoint).toHaveBeenCalledWith(
                mapPointData,
            );
        });
    });
});
