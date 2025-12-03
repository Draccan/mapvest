import { UpdateMapPointDto } from "../../../core/dtos/UpdateMapPointDto";
import { MapPointDto } from "../../../core/dtos/MapPointDto";
import UpdateMapPoint from "../../../core/usecases/UpdateMapPoint";
import Route from "../Route";
import getMapPointSchema from "../schemas/getMapPointSchema";
import getUpdateMapPointSchema from "../schemas/getUpdateMapPointSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    mapId: string;
    pointId: string;
}

export default (
    updateMapPoint: UpdateMapPoint,
): Route<ReqParams, void, UpdateMapPointDto, MapPointDto> => ({
    path: "/:groupId/maps/:mapId/points/:pointId",
    method: "put",
    operationObject: {
        tags: ["maps"],
        summary: "Update a map point",
        description: "Update an existing map point.",
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
            {
                name: "pointId",
                in: "path",
                required: true,
                schema: { type: "string" },
            },
        ],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: getUpdateMapPointSchema(),
                },
            },
        },
        responses: {
            200: {
                description: "Map point updated successfully",
                content: {
                    "application/json": {
                        schema: getMapPointSchema(),
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
            404: {
                description: "Not found - Map point does not exist",
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
        const { groupId, mapId, pointId } = req.params;
        const updatedMapPoint = await updateMapPoint.exec(
            pointId,
            req.body,
            userId,
            groupId,
            mapId,
        );

        res.status(200).json(updatedMapPoint);
    },
});
