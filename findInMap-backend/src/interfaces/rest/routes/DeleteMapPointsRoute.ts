import { DeleteMapPointsDto } from "../../../core/dtos/DeleteMapPointsDto";
import DeleteMapPoints from "../../../core/usecases/DeleteMapPoints";
import Route from "../Route";
import getDeleteMapPointsSchema from "../schemas/getDeleteMapPointsSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    mapId: string;
}

export default (
    deleteMapPoints: DeleteMapPoints,
): Route<ReqParams, void, DeleteMapPointsDto, void> => ({
    path: "/:groupId/maps/:mapId/points",
    method: "delete",
    operationObject: {
        tags: ["maps"],
        summary: "Delete map points",
        description: "Delete multiple map points by their IDs.",
        parameters: [
            auhtorizationParam,
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
            required: true,
            content: {
                "application/json": {
                    schema: getDeleteMapPointsSchema(),
                },
            },
        },
        responses: {
            204: {
                description: "Map points deleted successfully",
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
        const userId = (req as any).user!.userId;
        const groupId = req.params.groupId;
        const mapId = req.params.mapId;

        await deleteMapPoints.exec(req.body, userId, groupId, mapId);

        res.status(204).send();
    },
});
