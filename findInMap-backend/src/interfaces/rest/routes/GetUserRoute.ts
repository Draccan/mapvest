import GetUser from "../../../core/usecases/GetUser";
import UserDto from "../../../core/dtos/UserDto";
import Route from "../Route";
import getUserSchema from "../schemas/getUserSchema";
import { auhtorizationParam } from "./common/authorizationParam";

type ResBody = UserDto;

export default (getUser: GetUser): Route<void, void, void, ResBody> => ({
    path: "/users/me",
    method: "get",
    operationObject: {
        tags: ["users"],
        summary: "Get current user",
        description: "Get the authenticated user's information",
        parameters: [auhtorizationParam],
        responses: {
            200: {
                description: "User information",
                content: {
                    "application/json": {
                        schema: getUserSchema(),
                    },
                },
            },
            401: {
                description: "Unauthorized",
            },
            404: {
                description: "User not found",
            },
        },
    },
    handler: async (req, res) => {
        const userId = (req as any).user!.userId;
        const user = await getUser.exec(userId);
        res.status(200).json(user);
    },
});
