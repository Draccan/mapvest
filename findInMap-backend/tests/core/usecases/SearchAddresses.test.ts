import SearchAddresses from "../../../src/core/usecases/SearchAddresses";
import AddressesManagerRepository from "../../../src/core/dependencies/AddressesManagerRepository";
import AddressEntity from "../../../src/core/entities/AddressEntity";

describe("SearchAddresses UseCase", () => {
    let searchAddresses: SearchAddresses;
    let mockRepository: jest.Mocked<AddressesManagerRepository>;

    beforeEach(() => {
        mockRepository = {
            findByText: jest.fn(),
        };
        searchAddresses = new SearchAddresses(mockRepository);
    });

    it("should return addresses when text is provided", async () => {
        const mockAddressesEntity: AddressEntity[] = [
            {
                name: "Test Location",
                formattedAddress: "123 Test St, Test City",
                location: {
                    latitude: 45.4642,
                    longitude: 9.19,
                },
            },
        ];

        mockRepository.findByText.mockResolvedValue(mockAddressesEntity);

        const result = await searchAddresses.exec("test query");

        expect(result[0]).toEqual({
            label: "123 Test St, Test City",
            lat: 45.4642,
            long: 9.19,
        });
        expect(mockRepository.findByText).toHaveBeenCalledWith("test query");
        expect(mockRepository.findByText).toHaveBeenCalledTimes(1);
    });

    it("should not return addresses when the location is missing", async () => {
        const mockAddressesEntity: AddressEntity[] = [
            {
                name: "Test Location",
                formattedAddress: "123 Test St, Test City",
            },
        ];

        mockRepository.findByText.mockResolvedValue(mockAddressesEntity);

        const result = await searchAddresses.exec("test query");

        expect(result.length).toEqual(0);
        expect(mockRepository.findByText).toHaveBeenCalledWith("test query");
        expect(mockRepository.findByText).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when text is empty", async () => {
        const result = await searchAddresses.exec("");

        expect(result).toEqual([]);
        expect(mockRepository.findByText).not.toHaveBeenCalled();
    });

    it("should return empty array when text is only whitespace", async () => {
        const result = await searchAddresses.exec("   ");

        expect(result).toEqual([]);
        expect(mockRepository.findByText).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
        mockRepository.findByText.mockRejectedValue(
            new Error("Repository error"),
        );

        await expect(searchAddresses.exec("test")).rejects.toThrow(
            "Repository error",
        );
    });
});
