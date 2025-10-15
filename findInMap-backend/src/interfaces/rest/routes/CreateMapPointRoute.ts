import { CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import { MapPointDto } from "../../../core/dtos/MapPointDto";
import CreateMapPoint from "../../../core/usecases/CreateMapPoint";
import Route from "../Route";
import getCreateMapPointSchema from "../schemas/getCreateMapPointSchema";
import getMapPointSchema from "../schemas/getMapPointSchema";
import { auhtorizationParam } from "./common/authorizationParam";
import getClientIp from "./common/getClientIp";

export default (
    createMapPoint: CreateMapPoint,
): Route<void, void, CreateMapPointDto, MapPointDto> => ({
    path: "/map-points",
    method: "post",
    operationObject: {
        tags: ["map-points"],
        summary: "Create a new map point",
        description:
            "Create a new crime map point. Rate limited to 1 request per 15 seconds per IP.",
        parameters: [auhtorizationParam],
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
            429: {
                description: "Rate limit exceeded - too many requests",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                error: { type: "string" },
                                remainingTime: { type: "number" },
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
        const clientIp = getClientIp(req);
        const mapPoint = await createMapPoint.exec(req.body, clientIp);

        res.status(201).json(mapPoint);
    },
});
