export default interface AddressEntity {
    formattedAddress: string;
    name: string;
    location?: {
        latitude: number;
        longitude: number;
    };
}
