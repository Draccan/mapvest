import AddressesManagerRepository from "../dependencies/AddressesManagerRepository";
import AddressDto, { makeAddressDto } from "../dtos/AddressDto";
import AddressEntity from "../entities/AddressEntity";

export default class SearchAddresses {
    constructor(
        private addressesManagerRepository: AddressesManagerRepository,
    ) {}

    async exec(text: string): Promise<AddressDto[]> {
        if (text.trim().length === 0) {
            return [];
        }

        const addresses =
            await this.addressesManagerRepository.findByText(text);

        return addresses
            .filter((address) => !!address.location)
            .map((address) =>
                makeAddressDto(address as Required<AddressEntity>, text),
            );
    }
}
