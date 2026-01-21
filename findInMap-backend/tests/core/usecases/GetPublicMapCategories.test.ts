import MapEntity from "../../../src/core/entities/MapEntity";
import { MapCategoryEntity } from "../../../src/core/entities/MapCategoryEntity";
import ItemNotFoundError from "../../../src/core/errors/ItemNotFoundError";
import GetPublicMapCategories from "../../../src/core/usecases/GetPublicMapCategories";
import { mockMapRepository } from "../../helpers";

describe("GetPublicMapCategories", () => {
    let getPublicMapCategories: GetPublicMapCategories;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        getPublicMapCategories = new GetPublicMapCategories(mockMapRepository);
    });

    describe("exec", () => {
        it("should return all categories for a public map", async () => {
            const publicMapId = "public-map-123";
            const mapId = "map-1";

            const mockMap: MapEntity = {
                id: mapId,
                groupId: "group-1",
                name: "Public Map",
                isPublic: true,
                publicId: publicMapId,
            };

            const mockCategories: MapCategoryEntity[] = [
                {
                    id: "category-1",
                    map_id: mapId,
                    description: "Furto",
                    color: "#FF0000",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
                {
                    id: "category-2",
                    map_id: mapId,
                    description: "Rapina",
                    color: "#00FF00",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.findMapByPublicId.mockResolvedValue(mockMap);
            mockMapRepository.findCategoriesByMapId.mockResolvedValue(
                mockCategories,
            );

            const result = await getPublicMapCategories.exec(publicMapId);

            expect(result).toEqual([
                {
                    id: "category-1",
                    description: "Furto",
                    color: "#FF0000",
                },
                {
                    id: "category-2",
                    description: "Rapina",
                    color: "#00FF00",
                },
            ]);
            expect(mockMapRepository.findMapByPublicId).toHaveBeenCalledWith(
                publicMapId,
            );
            expect(
                mockMapRepository.findCategoriesByMapId,
            ).toHaveBeenCalledWith(mapId);
        });

        it("should throw ItemNotFoundError when public map is not found", async () => {
            const publicMapId = "non-existent-public-id";

            mockMapRepository.findMapByPublicId.mockResolvedValue(null);

            await expect(
                getPublicMapCategories.exec(publicMapId),
            ).rejects.toThrow(ItemNotFoundError);
            expect(mockMapRepository.findMapByPublicId).toHaveBeenCalledWith(
                publicMapId,
            );
            expect(
                mockMapRepository.findCategoriesByMapId,
            ).not.toHaveBeenCalled();
        });

        it("should return empty array when no categories exist", async () => {
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
            mockMapRepository.findCategoriesByMapId.mockResolvedValue([]);

            const result = await getPublicMapCategories.exec(publicMapId);

            expect(result).toEqual([]);
            expect(mockMapRepository.findMapByPublicId).toHaveBeenCalledWith(
                publicMapId,
            );
            expect(
                mockMapRepository.findCategoriesByMapId,
            ).toHaveBeenCalledWith(mapId);
        });
    });
});
