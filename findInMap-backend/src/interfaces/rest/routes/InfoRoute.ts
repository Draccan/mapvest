import config from "../../../main/config";
import Route from "../Route";
import getInfoSchema from "../schemas/getInfoSchema";

interface HealthResponse {
    name: string;
    description: string;
    swagger: string;
    version: string;
}

export default (): Route<void, void, void, HealthResponse> => ({
    path: "/info",
    method: "get",
    operationObject: {
        tags: ["info"],
        summary: "Information endpoint",
        description: "Get information about the API server",
        responses: {
            200: {
                description: "Server info",
                content: {
                    "application/json": {
                        schema: getInfoSchema(),
                    },
                },
            },
        },
    },
    handler: async (req, res) => {
        res.status(200).json({
            name: config.appName,
            version: config.appVersion,
            description: "FindInMap Backend API for managing crime map points",
            swagger: `${config.publicUrl}/swagger`,
        });
    },
});
