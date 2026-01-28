import MapPointDto from "../../../core/dtos/MapPointDto";
import GetPublicMapPoints from "../../../core/usecases/GetPublicMapPoints";
import Route from "../Route";
import getMapPointSchema from "../schemas/getMapPointSchema";

interface ReqParams {
    publicMapId: string;
}

export default (
    getPublicMapPoints: GetPublicMapPoints,
): Route<ReqParams, void, void, MapPointDto[]> => ({
    path: "/public/maps/:publicMapId/points",
    method: "get",
    operationObject: {
        tags: ["public"],
        summary: "Get all map points from a public map",
        description: "Retrieve all map points from a public map",
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
                description: "List of map points",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: getMapPointSchema(),
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
        const mapPoints = await getPublicMapPoints.exec(publicMapId);

        res.status(200).json(mapPoints);
    },
});
