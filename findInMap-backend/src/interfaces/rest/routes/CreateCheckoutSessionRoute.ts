import CheckoutSessionDto from "../../../core/dtos/CheckoutSessionDto";
import CreateCheckoutSessionDto from "../../../core/dtos/CreateCheckoutSessionDto";
import CreateCheckoutSession from "../../../core/usecases/CreateCheckoutSession";
import Route from "../Route";
import getCheckoutSessionSchema from "../schemas/getCheckoutSessionSchema";
import getCreatePaymentCheckoutSessionSchema from "../schemas/getCreatePaymentCheckoutSessionSchema";
import { auhtorizationParam } from "./common/authorizationParam";

type ReqBody = CreateCheckoutSessionDto;

type ResBody = CheckoutSessionDto;

export default (
    createCheckoutSession: CreateCheckoutSession,
): Route<void, void, ReqBody, ResBody> => {
    return {
        path: "/payments/checkout-session",
        method: "post",
        operationObject: {
            summary:
                "Create a Stripe checkout session for upgrading a group to Pro plan",
            tags: ["payments"],
            parameters: [auhtorizationParam],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: getCreatePaymentCheckoutSessionSchema(),
                    },
                },
            },
            responses: {
                200: {
                    description: "Checkout session created",
                    content: {
                        "application/json": {
                            schema: getCheckoutSessionSchema(),
                        },
                    },
                },
                403: {
                    description:
                        "Forbidden - User is not the owner of the group",
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
            const { groupId } = req.body;

            const result = await createCheckoutSession.exec(userId, groupId);

            res.status(200).json(result);
        },
    };
};
