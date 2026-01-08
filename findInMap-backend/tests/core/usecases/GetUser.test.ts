import GetUser from "../../../src/core/usecases/GetUser";
import UserRepository from "../../../src/core/dependencies/UserRepository";
import UserEntity from "../../../src/core/entities/UserEntity";
import UserNotFoundError from "../../../src/core/errors/UserNotFoundError";

describe("GetUser", () => {
    let getUser: GetUser;
    let mockUserRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        mockUserRepository = {
            findById: jest.fn(),
    findByIds: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            updatePassword: jest.fn(),
            createPasswordResetToken: jest.fn(),
            deletePasswordResetTokensByUserId: jest.fn(),
            findPasswordResetTokenData: jest.fn(),
            deletePasswordResetToken: jest.fn(),
        };

        getUser = new GetUser(mockUserRepository);
    });

    it("should return user data when user exists", async () => {
        const mockUser: UserEntity = {
            id: "user-123",
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            password: "hashedPassword",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
        };

        mockUserRepository.findById.mockResolvedValue(mockUser);

        const result = await getUser.exec("user-123");

        expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
        expect(result).toEqual({
            id: "user-123",
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
        });
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        await expect(getUser.exec("non-existent-user")).rejects.toThrow(
            UserNotFoundError,
        );
        expect(mockUserRepository.findById).toHaveBeenCalledWith(
            "non-existent-user",
        );
    });
});
