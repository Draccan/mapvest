import {
    Client,
    PlaceInputType,
    Language,
} from "@googlemaps/google-maps-services-js";

import AddressesManagerRepository from "../../core/dependencies/AddressesManagerRepository";
import AddressEntity from "../../core/entities/AddressEntity";
import { makeAddressEntity } from "./converters/makeAddressEntity";

export default class GoogleRepository implements AddressesManagerRepository {
    private readonly googleClient: Client;
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.googleClient = new Client({});
    }

    async findByText(text: string): Promise<AddressEntity[]> {
        try {
            const response = await this.googleClient.findPlaceFromText({
                params: {
                    input: text,
                    inputtype: PlaceInputType.textQuery,
                    fields: ["formatted_address", "geometry", "name"],
                    key: this.apiKey,
                    // TODO: handle other languages
                    language: Language.it,
                },
            });

            console.log(
                "AAA response:",
                response.data.candidates
                    .filter((place) => !!place.geometry)
                    .map((place) => makeAddressEntity(place, text)),
            );

            return response.data.candidates
                .filter((place) => !!place.geometry)
                .map((place) => makeAddressEntity(place, text));
        } catch (error) {
            console.error("Error fetching Google Places API:", error);
            throw error;
        }
    }
}
