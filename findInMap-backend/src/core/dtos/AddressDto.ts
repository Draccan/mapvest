import AddressEntity from "../entities/AddressEntity";

export default interface AddressDto {
    lat: number;
    long: number;
    label: string;
}

export function makeAddressDto(
    address: AddressEntity,
    searchedAddress?: string,
): AddressDto {
    return {
        lat: address.location.latitude,
        long: address.location.longitude,
        label:
            address.formattedAddress ||
            address.displayName ||
            searchedAddress ||
            "",
    };
}
