import PublicMapDto from "../../../core/dtos/PublicMapDto";
import GetPublicMap from "../../../core/usecases/GetPublicMap";
import Route from "../Route";
import getPublicMapSchema from "../schemas/getPublicMapSchema";

interface ReqParams {
    publicMapId: string;
}

export default (
    getPublicMap: GetPublicMap,
): Route<ReqParams, void, void, PublicMapDto> => {
    return {
        path: "/public/maps/:publicMapId",
        method: "get",
        operationObject: {
            summary: "Get public map data",
            tags: ["public"],
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
                    description: "Public map data",
                    content: {
                        "application/json": {
                            schema: getPublicMapSchema(),
                        },
                    },
                },
                404: {
                    description: "Map not found",
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

            const publicMap = await getPublicMap.execute(publicMapId);

            res.status(200).json(publicMap);
        },
    };
};
