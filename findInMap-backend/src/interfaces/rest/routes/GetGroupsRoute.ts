import GroupDto from "../../../core/dtos/GroupDto";
import GetUserGroups from "../../../core/usecases/GetUserGroups";
import Route from "../Route";
import getDetailedGroupSchema from "../schemas/getDetailedGroupSchema";
import { auhtorizationParam } from "./common/authorizationParam";

export default (
    getUserGroups: GetUserGroups,
): Route<void, void, void, GroupDto[]> => ({
    path: "/groups",
    method: "get",
    operationObject: {
        tags: ["groups"],
        summary: "Get user groups",
        description:
            "Retrieve all groups associated with the authenticated user",
        parameters: [auhtorizationParam],
        responses: {
            200: {
                description: "List of user groups",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: getDetailedGroupSchema(),
                        },
                    },
                },
            },
            401: {
                description: "Unauthorized",
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

        const groups = await getUserGroups.exec(userId);

        res.status(200).json(groups);
    },
});
