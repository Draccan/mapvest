import config from "../../../main/config";
import Route from "../Route";
import getHealthSchema from "../schemas/getHealthSchema";

interface HealthResponse {
    status: string;
    message: string;
    timestamp: string;
    version: string;
}

export default (): Route<void, void, void, HealthResponse> => ({
    path: "/health",
    method: "get",
    operationObject: {
        tags: ["health"],
        summary: "Health check endpoint",
        description: "Check if the API server is running and healthy",
        responses: {
            200: {
                description: "Server is healthy",
                content: {
                    "application/json": {
                        schema: getHealthSchema(),
                    },
                },
            },
        },
    },
    handler: async (_req, res) => {
        res.status(200).json({
            status: "ok",
            message: "FindInMap Backend API is running",
            timestamp: new Date().toISOString(),
            version: config.appVersion,
        });
    },
});
