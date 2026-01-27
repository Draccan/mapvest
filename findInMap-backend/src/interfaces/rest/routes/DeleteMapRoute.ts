import DeleteMap from "../../../core/usecases/DeleteMap";
import Route from "../Route";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    mapId: string;
}

export default (deleteMap: DeleteMap): Route<ReqParams, void, void, void> => ({
    path: "/:groupId/maps/:mapId",
    method: "delete",
    operationObject: {
        tags: ["maps"],
        summary: "Delete a map",
        description: "Delete a map and all associated data.",
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
        ],
        responses: {
            204: {
                description: "Map deleted successfully",
            },
            403: {
                description:
                    "Forbidden - User does not have access or has not the right role",
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
        const { groupId, mapId } = req.params;

        await deleteMap.exec(mapId, groupId, userId);

        res.status(204).send();
    },
});
