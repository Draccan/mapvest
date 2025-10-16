import AddressEntity from "../entities/AddressEntity";

export default interface AddressesManagerRepository {
    findByText(text: string): Promise<AddressEntity[]>;
}
