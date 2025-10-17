import { PlaceData } from "@googlemaps/google-maps-services-js";

import AddressEntity from "../../../core/entities/AddressEntity";

export function makeAddressEntity(
    googlePlace: Partial<PlaceData>,
    searchedPlace: string,
): AddressEntity {
    return {
        name: googlePlace.name || searchedPlace,
        formattedAddress: googlePlace.formatted_address || searchedPlace,
        location: googlePlace.geometry
            ? {
                  latitude: googlePlace.geometry.location.lat || 0,
                  longitude: googlePlace.geometry.location.lng || 0,
              }
            : undefined,
    };
}
