import { CategoryDto } from "../../../core/dtos/CategoryDto";
import GetPublicMapCategories from "../../../core/usecases/GetPublicMapCategories";
import Route from "../Route";
import getMapCategorySchema from "../schemas/getMapCategorySchema";

interface ReqParams {
    publicMapId: string;
}

type ResBody = CategoryDto[];

export default (
    getPublicMapCategories: GetPublicMapCategories,
): Route<ReqParams, void, void, ResBody> => ({
    path: "/public/maps/:publicMapId/categories",
    method: "get",
    operationObject: {
        tags: ["public"],
        summary: "Get all categories from a public map",
        description: "Retrieve all categories from a public map",
        parameters: [
            {
                name: "publicMapId",
                in: "path",
                required: true,
                schema: { type: "string" },
            },
        ],
        responses: {
            200: {
                description: "List of categories",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: getMapCategorySchema(),
                        },
                    },
                },
            },
            404: {
                description: "Public map not found",
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
        const publicMapId = req.params.publicMapId;
        const categories = await getPublicMapCategories.exec(publicMapId);

        res.status(200).json(categories);
    },
});
