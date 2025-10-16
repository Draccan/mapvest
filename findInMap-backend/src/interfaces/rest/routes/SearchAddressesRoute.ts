import AddressDto from "../../../core/dtos/AddressDto";
import SearchAddresses from "../../../core/usecases/SearchAddresses";
import Route from "../Route";
import getAddressDtoSchema from "../schemas/getAddressDtoSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqQuery {
    text: string;
}

export default (
    searchAddresses: SearchAddresses,
): Route<void, ReqQuery, void, AddressDto[]> => ({
    path: "/search/addresses",
    method: "get",
    operationObject: {
        tags: ["search"],
        summary: "Search addresses",
        description: "Search for addresses using text.",
        parameters: [
            auhtorizationParam,
            {
                name: "text",
                in: "query",
                required: true,
                description: "Text to search for addresses",
                schema: {
                    type: "string",
                    minLength: 1,
                },
            },
        ],
        responses: {
            200: {
                description: "List of addresses matching the search text",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: getAddressDtoSchema(),
                        },
                    },
                },
            },
            400: {
                description: "Bad request - missing or invalid query parameter",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                error: { type: "string" },
                            },
                        },
                    },
                },
            },
            401: {
                description: "Unauthorized - invalid or missing token",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
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
                                error: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
    },
    handler: async (req, res) => {
        const { text } = req.query;

        const addresses = await searchAddresses.exec(text);
        res.status(200).json(addresses);
    },
});
