import { UserGroupRole } from "../../../src/core/commons/enums";
import CreateMapCategory from "../../../src/core/usecases/CreateMapCategory";
import CreateCategoryDto from "../../../src/core/dtos/CreateCategoryDto";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import { mockGroupRepository, mockMapRepository } from "../../helpers";

describe("CreateMapCategory", () => {
    const usecase = new CreateMapCategory(
        mockGroupRepository,
        mockMapRepository,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a category when user has access to group and map exists", async () => {
        const userId = "user123";
        const groupId = "group123";
        const mapId = "map123";
        const createCategoryDto: CreateCategoryDto = {
            description: "Furto",
            color: "#FF0000",
        };

        mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
            {
                group: {
                    id: groupId,
                    name: "Test Group",
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                role: UserGroupRole.Owner,
            },
        ]);

        mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
            { id: mapId, groupId: groupId, name: "Test Map" },
        ]);

        mockMapRepository.createCategory.mockResolvedValue({
            id: "category123",
            map_id: mapId,
            description: createCategoryDto.description,
            color: createCategoryDto.color,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const result = await usecase.exec(
            userId,
            groupId,
            mapId,
            createCategoryDto,
        );

        expect(result).toBeDefined();
        expect(result.id).toBe("category123");
        expect(result.description).toBe(createCategoryDto.description);
        expect(result.color).toBe(createCategoryDto.color);
        expect(mockMapRepository.createCategory).toHaveBeenCalledWith(
            mapId,
            createCategoryDto,
        );
    });

    it("should throw NotAllowedActionError when user does not have access to group", async () => {
        const userId = "user123";
        const groupId = "group123";
        const mapId = "map123";
        const createCategoryDto: CreateCategoryDto = {
            description: "Furto",
            color: "#FF0000",
        };

        mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

        await expect(
            usecase.exec(userId, groupId, mapId, createCategoryDto),
        ).rejects.toThrow(NotAllowedActionError);
    });

    it("should throw NotAllowedActionError when map does not belong to group", async () => {
        const userId = "user123";
        const groupId = "group123";
        const mapId = "map123";
        const createCategoryDto: CreateCategoryDto = {
            description: "Furto",
            color: "#FF0000",
        };

        mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
            {
                group: {
                    id: groupId,
                    name: "Test Group",
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                role: UserGroupRole.Owner,
            },
        ]);

        mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([]);

        await expect(
            usecase.exec(userId, groupId, mapId, createCategoryDto),
        ).rejects.toThrow(NotAllowedActionError);
    });
});
