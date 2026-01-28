import UpdateMapCategory from "../../../core/usecases/UpdateMapCategory";
import UpdateCategoryDto from "../../../core/dtos/UpdateCategoryDto";
import { CategoryDto } from "../../../core/dtos/CategoryDto";
import Route from "../Route";
import { auhtorizationParam } from "./common/authorizationParam";
import getUpdateMapCategorySchema from "../schemas/getUpdateMapCategorySchema";
import getMapCategorySchema from "../schemas/getMapCategorySchema";

interface ReqParams {
    groupId: string;
    mapId: string;
    categoryId: string;
}

type ReqBody = UpdateCategoryDto;

type ResBody = CategoryDto;

export default (
    updateMapCategory: UpdateMapCategory,
): Route<ReqParams, void, ReqBody, ResBody> => ({
    path: "/:groupId/maps/:mapId/categories/:categoryId",
    method: "put",
    operationObject: {
        tags: ["maps"],
        summary: "Update a category",
        description: "Update the category of a map.",
        parameters: [
            auhtorizationParam,
            {
                name: "groupId",
                in: "path",
                required: true,
                schema: { type: "string", format: "uuid" },
            },
            {
                name: "mapId",
                in: "path",
                required: true,
                schema: { type: "string", format: "uuid" },
            },
            {
                name: "categoryId",
                in: "path",
                required: true,
                schema: { type: "string", format: "uuid" },
            },
        ],
        requestBody: {
            content: {
                "application/json": {
                    schema: getUpdateMapCategorySchema(),
                },
            },
            required: true,
        },
        responses: {
            200: {
                description: "Category updated successfully",
                content: {
                    "application/json": {
                        schema: getMapCategorySchema(),
                    },
                },
            },
            403: {
                description:
                    "Forbidden - User does not have access to this group or map",
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
            404: {
                description: "Not found - Category not found",
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
            401: {
                description: "Unauthorized - Invalid or missing token",
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
        const userId = (req as any).user!.userId;
        const { groupId, mapId, categoryId } = req.params;

        const category = await updateMapCategory.exec(
            userId,
            groupId,
            mapId,
            categoryId,
            req.body,
        );

        res.status(200).send(category);
    },
});
