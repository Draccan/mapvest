import GetMapCategories from "../../../core/usecases/GetMapCategories";
import Route from "../Route";
import { CategoryDto } from "../../../core/dtos/CategoryDto";
import getMapCategorySchema from "../schemas/getMapCategorySchema";

interface ReqParams {
    groupId: string;
    mapId: string;
}

type ResBody = CategoryDto[];

export default (
    getMapCategories: GetMapCategories,
): Route<ReqParams, void, void, ResBody> => ({
    path: "/:groupId/maps/:mapId/categories",
    method: "get",
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

        const categories = await getMapCategories.exec(userId, groupId, mapId);

        res.status(200).send(categories);
    },
});
