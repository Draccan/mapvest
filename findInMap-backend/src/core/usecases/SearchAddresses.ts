import AddressesManagerRepository from "../dependencies/AddressesManagerRepository";
import AddressDto, { makeAddressDto } from "../dtos/AddressDto";

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

        return addresses.map((address) => makeAddressDto(address, text));
    }
}
