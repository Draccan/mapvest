import { CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import { MapPointDto } from "../../../core/dtos/MapPointDto";
import CreateMapPoint from "../../../core/usecases/CreateMapPoint";
import Route from "../Route";
import getCreateMapPointSchema from "../schemas/getCreateMapPointSchema";
import getMapPointSchema from "../schemas/getMapPointSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    mapId: string;
}

export default (
    createMapPoint: CreateMapPoint,
): Route<ReqParams, void, CreateMapPointDto, MapPointDto> => ({
    path: "/:groupId/maps/:mapId/points",
    method: "post",
    operationObject: {
        tags: ["maps"],
        summary: "Create a new map point",
        description: "Create a new crime map point.",
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
                    schema: getCreateMapPointSchema(),
                },
            },
        },
        responses: {
            201: {
                description: "Map point created successfully",
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
        const mapPoint = await createMapPoint.exec(
            req.body,
            userId,
            groupId,
            mapId,
        );

        res.status(201).json(mapPoint);
    },
});
