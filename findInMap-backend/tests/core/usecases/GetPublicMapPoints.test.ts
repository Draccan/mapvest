import MapEntity from "../../../src/core/entities/MapEntity";
import { MapPointEntity } from "../../../src/core/entities/MapPointEntity";
import ItemNotFoundError from "../../../src/core/errors/ItemNotFoundError";
import GetPublicMapPoints from "../../../src/core/usecases/GetPublicMapPoints";
import { mockMapRepository } from "../../helpers";

describe("GetPublicMapPoints", () => {
    let getPublicMapPoints: GetPublicMapPoints;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        getPublicMapPoints = new GetPublicMapPoints(mockMapRepository);
    });

    describe("exec", () => {
        it("should return all map points for a public map", async () => {
            const publicMapId = "public-map-123";
            const mapId = "map-1";

            const mockMap: MapEntity = {
                id: mapId,
                groupId: "group-1",
                name: "Public Map",
                isPublic: true,
                publicId: publicMapId,
            };

            const mockMapPoints: MapPointEntity[] = [
                {
                    id: "point-1",
                    long: 45.0,
                    lat: 9.0,
                    description: "Theft",
                    date: "2025-10-02",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
                {
                    id: "point-2",
                    long: 46.0,
                    lat: 10.0,
                    description: "Aggression",
                    date: "2023-01-02",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.findMapByPublicId.mockResolvedValue(mockMap);
            mockMapRepository.findAllMapPoints.mockResolvedValue(mockMapPoints);

            const result = await getPublicMapPoints.exec(publicMapId);

            expect(result).toEqual([
                {
                    id: "point-1",
                    long: 45.0,
                    lat: 9.0,
                    description: "Theft",
                    date: "2025-10-02",
                    createdAt: mockDate,
                },
                {
                    id: "point-2",
                    long: 46.0,
                    lat: 10.0,
                    description: "Aggression",
                    date: "2023-01-02",
                    createdAt: mockDate,
                },
            ]);
            expect(mockMapRepository.findMapByPublicId).toHaveBeenCalledWith(
                publicMapId,
            );
            expect(mockMapRepository.findAllMapPoints).toHaveBeenCalledWith(
                mapId,
            );
        });

        it("should throw ItemNotFoundError when public map is not found", async () => {
            const publicMapId = "non-existent-public-id";

            mockMapRepository.findMapByPublicId.mockResolvedValue(null);

            await expect(getPublicMapPoints.exec(publicMapId)).rejects.toThrow(
                ItemNotFoundError,
            );
            expect(mockMapRepository.findMapByPublicId).toHaveBeenCalledWith(
                publicMapId,
            );
            expect(mockMapRepository.findAllMapPoints).not.toHaveBeenCalled();
        });

        it("should return empty array when no map points exist", async () => {
            const publicMapId = "public-map-456";
            const mapId = "map-2";

            const mockMap: MapEntity = {
                id: mapId,
                groupId: "group-2",
                name: "Empty Public Map",
                isPublic: true,
                publicId: publicMapId,
            };

            mockMapRepository.findMapByPublicId.mockResolvedValue(mockMap);
            mockMapRepository.findAllMapPoints.mockResolvedValue([]);

            const result = await getPublicMapPoints.exec(publicMapId);

            expect(result).toEqual([]);
            expect(mockMapRepository.findMapByPublicId).toHaveBeenCalledWith(
                publicMapId,
            );
            expect(mockMapRepository.findAllMapPoints).toHaveBeenCalledWith(
                mapId,
            );
        });
    });
});
