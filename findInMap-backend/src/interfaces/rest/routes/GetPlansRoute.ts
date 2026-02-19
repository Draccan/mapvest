import PlanDto from "../../../core/dtos/PlanDto";
import GetPlans from "../../../core/usecases/GetPlans";
import Route from "../Route";
import getPlanSchema from "../schemas/getPlanSchema";

export default (getPlans: GetPlans): Route<void, void, void, PlanDto[]> => ({
    path: "/plans",
    method: "get",
    operationObject: {
        tags: ["plans"],
        summary: "Get plans",
        description: "Retrieve all available plans and their rules",
        responses: {
            200: {
                description: "List of plans",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: getPlanSchema(),
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
    handler: async (_req, res) => {
        const plans = await getPlans.exec();
        res.status(200).json(plans);
    },
});
