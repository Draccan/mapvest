import {
    CreateMapPointDto,
    CreateMapPointResponseDto,
} from "../../../core/dtos/CreateMapPointDto";
import { RateLimitErrorResponseDto } from "../../../core/dtos/RateLimitErrorResponseDto";
import { RateLimitError } from "../../../core/errors/RateLimitError";
import CreateMapPoint from "../../../core/usecases/CreateMapPoint";
import Route from "../Route";
import getCreateMapPointSchema from "../schemas/getCreateMapPointSchema";
import getMapPointSchema from "../schemas/getMapPointSchema";
import getClientIp from "./common/getClientIp";

export default (
    createMapPoint: CreateMapPoint,
): Route<void, void, CreateMapPointDto, CreateMapPointResponseDto> => ({
    path: "/api/map-points",
    method: "post",
    operationObject: {
        tags: ["map-points"],
        summary: "Create a new map point",
        description:
            "Create a new crime map point. Rate limited to 1 request per 15 seconds per IP.",
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
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                data: getMapPointSchema(),
                                error: { type: "string" },
                            },
                            required: ["success", "data"],
                        },
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
        try {
            const clientIp = getClientIp(req);
            const mapPoint = await createMapPoint.exec(req.body, clientIp);

            const response: CreateMapPointResponseDto = {
                success: true,
                data: mapPoint,
            };

            res.status(201).json(response);
        } catch (error) {
            if (error instanceof RateLimitError) {
                const response: RateLimitErrorResponseDto = {
                    success: false,
                    error: error.message,
                    remainingTime: error.remainingTime,
                };
                res.status(429).json(response);
            } else if (
                error instanceof Error &&
                error.message.includes("required")
            ) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                });
            } else if (
                error instanceof Error &&
                error.message.includes("Invalid")
            ) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: "Failed to create map point",
                });
            }
        }
    },
});
