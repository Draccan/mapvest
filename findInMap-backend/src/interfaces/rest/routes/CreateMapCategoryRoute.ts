import CreateMapCategory from "../../../core/usecases/CreateMapCategory";
import Route from "../Route";
import CreateCategoryDto from "../../../core/dtos/CreateCategoryDto";
import { CategoryDto } from "../../../core/dtos/CategoryDto";
import getCreateMapCategorySchema from "../schemas/getCreateMapCategorySchema";
import getMapCategorySchema from "../schemas/getMapCategorySchema";

interface ReqParams {
    groupId: string;
    mapId: string;
}

type ReqBody = CreateCategoryDto;

type ResBody = CategoryDto;

export default (
    createMapCategory: CreateMapCategory,
): Route<ReqParams, void, ReqBody, ResBody> => ({
    path: "/:groupId/maps/:mapId/categories",
    method: "post",
    operationObject: {
        tags: ["maps"],
        parameters: [
            {
                name: "groupId",
                in: "path",
                required: true,
                schema: { type: "string" },
            },
            {
                name: "mapId",
                in: "path",
                required: true,
                schema: { type: "string" },
            },
        ],
        requestBody: {
            content: {
                "application/json": {
                    schema: getCreateMapCategorySchema(),
                },
            },
            required: true,
        },
        responses: {
            201: {
                description: "Category created",
                content: {
                    "application/json": {
                        schema: getMapCategorySchema(),
                    },
                },
            },
            400: {
                description: "Bad request - invalid input data",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                error: { type: "string" },
                            },
                        },
                    },
                },
            },
            403: {
                description:
                    "Forbidden - User does not have access to this map",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                error: { type: "string" },
                            },
                        },
                    },
                },
            },
            500: {
                description: "Internal server error",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                error: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
    },
    handler: async (req, res) => {
        const { groupId, mapId } = req.params;
        const userId = (req as any).user!.userId;

        const category = await createMapCategory.exec(
            userId,
            groupId,
            mapId,
            req.body,
        );

        res.status(201).send(category);
    },
});
