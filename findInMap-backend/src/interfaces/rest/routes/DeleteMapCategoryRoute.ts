import DeleteMapCategory from "../../../core/usecases/DeleteMapCategory";
import Route from "../Route";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    mapId: string;
    categoryId: string;
}

export default (
    deleteMapCategory: DeleteMapCategory,
): Route<ReqParams, void, void, void> => ({
    path: "/:groupId/maps/:mapId/categories/:categoryId",
    method: "delete",
    operationObject: {
        tags: ["maps"],
        summary: "Delete a category from a map",
        description:
            "Delete a category and remove it from all associated map points.",
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
        responses: {
            204: {
                description: "Category deleted successfully",
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

        await deleteMapCategory.exec(userId, groupId, mapId, categoryId);

        res.status(204).send();
    },
});