export default interface AddressEntity {
    formattedAddress?: string;
    displayName?: string;
    location: {
        latitude: number;
        longitude: number;
    };
}
