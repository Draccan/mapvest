import AddressesManagerRepository from "../../core/dependencies/AddressesManagerRepository";
import AddressEntity from "../../core/entities/AddressEntity";
import { makeAddressEntity } from "./converters/makeAddressEntity";
import GooglePlaceSearchResponse from "./types/GooglePlaceSearchResponse";

export default class GoogleRepository implements AddressesManagerRepository {
    private readonly apiKey: string;
    private readonly baseUrl =
        "https://places.googleapis.com/v1/places:searchText";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async findByText(text: string): Promise<AddressEntity[]> {
        const requestBody = {
            textQuery: text,
            languageCode: "it",
            maxResultCount: 10,
        };

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": this.apiKey,
                    "X-Goog-FieldMask":
                        "places.displayName,places.formattedAddress,places.location",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(
                    `Google Places API error: ${response.status} ${response.statusText}`,
                );
            }

            const data: GooglePlaceSearchResponse = await response.json();

            return data.places.map(makeAddressEntity);
        } catch (error) {
            console.error("Error fetching from Google Places API:", error);
            throw error;
        }
    }
}
