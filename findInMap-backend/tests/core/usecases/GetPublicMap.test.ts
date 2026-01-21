import MapEntity from "../../../src/core/entities/MapEntity";
import ItemNotFoundError from "../../../src/core/errors/ItemNotFoundError";
import GetPublicMap from "../../../src/core/usecases/GetPublicMap";
import { mockMapRepository } from "../../helpers";

describe("GetPublicMap", () => {
    let getPublicMap: GetPublicMap;

    beforeEach(() => {
        jest.clearAllMocks();
        getPublicMap = new GetPublicMap(mockMapRepository);
    });

    describe("execute", () => {
        it("should successfully retrieve a public map by publicId", async () => {
            const publicId = "public-map-123";

            const mockMap: MapEntity = {
                id: "map-1",
                groupId: "group-1",
                name: "Public Map",
                isPublic: true,
                publicId: publicId,
            };

            mockMapRepository.findMapByPublicId.mockResolvedValue(mockMap);

            const result = await getPublicMap.execute(publicId);

            expect(result).toEqual({
                name: "Public Map",
                publicId: publicId,
            });
            expect(mockMapRepository.findMapByPublicId).toHaveBeenCalledWith(
                publicId,
            );
        });

        it("should throw ItemNotFoundError when map is not found", async () => {
            const publicId = "non-existent-public-id";

            mockMapRepository.findMapByPublicId.mockResolvedValue(null);

            await expect(getPublicMap.execute(publicId)).rejects.toThrow(
                ItemNotFoundError,
            );
            expect(mockMapRepository.findMapByPublicId).toHaveBeenCalledWith(
                publicId,
            );
        });

        it("should return correct PublicMapDto structure", async () => {
            const publicId = "public-map-456";

            const mockMap: MapEntity = {
                id: "map-2",
                groupId: "group-2",
                name: "Another Public Map",
                isPublic: true,
                publicId: publicId,
            };

            mockMapRepository.findMapByPublicId.mockResolvedValue(mockMap);

            const result = await getPublicMap.execute(publicId);

            expect(result).toHaveProperty("name");
            expect(result).toHaveProperty("publicId");
            expect(Object.keys(result).length).toBe(2);
        });
    });
});
