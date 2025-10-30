import { MapPointType } from "../../../src/core/commons/enums";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import { CreateMapPointDto } from "../../../src/core/dtos/CreateMapPointDto";
import { MapPointEntity } from "../../../src/core/entities/MapPointEntity";
import { RateLimitError } from "../../../src/core/errors/RateLimitError";
import { RateLimitService } from "../../../src/core/services/RateLimitService";
import CreateMapPoint from "../../../src/core/usecases/CreateMapPoint";

const mockMapPointRepository: jest.Mocked<MapRepository> = {
    createMapPoint: jest.fn(),
    findAllMapPoints: jest.fn(),
    findMapPointById: jest.fn(),
    findMapByGroupId: jest.fn(),
};

const mockRateLimitService: jest.Mocked<RateLimitService> = {
    isAllowed: jest.fn(),
    recordRequest: jest.fn(),
    cleanup: jest.fn(),
    getRemainingTime: jest.fn(),
};

describe("CreateMapPoint", () => {
    let createMapPoint: CreateMapPoint;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        createMapPoint = new CreateMapPoint(
            mockMapPointRepository,
            mockRateLimitService,
        );
    });

    describe("exec", () => {
        it("should successfully create a map point", async () => {
            const clientIp = "192.168.1.1";
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

            mockRateLimitService.isAllowed.mockReturnValue(true);
            mockMapPointRepository.createMapPoint.mockResolvedValue(
                mockCreatedMapPoint,
            );

            const result = await createMapPoint.exec(mapPointData, clientIp);

            expect(result).toEqual({
                id: 1,
                long: 45.0,
                lat: 9.0,
                type: MapPointType.Theft,
                date: "2025-10-02",
                createdAt: mockDate,
            });
            expect(mockRateLimitService.isAllowed).toHaveBeenCalledWith(
                clientIp,
            );
            expect(mockRateLimitService.recordRequest).toHaveBeenCalledWith(
                clientIp,
            );
            expect(mockMapPointRepository.createMapPoint).toHaveBeenCalledWith(
                mapPointData,
            );
        });

        it("should throw RateLimitError when rate limit exceeded", async () => {
            const clientIp = "192.168.1.2";
            const mapPointData: CreateMapPointDto = {
                long: 45.0,
                lat: 9.0,
                type: MapPointType.Aggression,
                date: "2025-10-02",
            };

            mockRateLimitService.isAllowed.mockReturnValue(false);
            mockRateLimitService.getRemainingTime.mockReturnValue(10);

            await expect(
                createMapPoint.exec(mapPointData, clientIp),
            ).rejects.toThrow(RateLimitError);
            expect(mockRateLimitService.isAllowed).toHaveBeenCalledWith(
                clientIp,
            );
            expect(mockRateLimitService.recordRequest).not.toHaveBeenCalled();
            expect(
                mockMapPointRepository.createMapPoint,
            ).not.toHaveBeenCalled();
        });
    });
});
