import AddressEntity from "../../../core/entities/AddressEntity";
import { GooglePlace } from "../types/GooglePlaceSearchResponse";

export function makeAddressEntity(googlePlace: GooglePlace): AddressEntity {
    return {
        displayName: googlePlace.displayName?.text || "",
        formattedAddress: googlePlace.formattedAddress || "",
        location: {
            latitude: googlePlace.location?.latitude,
            longitude: googlePlace.location?.longitude,
        },
    };
}
