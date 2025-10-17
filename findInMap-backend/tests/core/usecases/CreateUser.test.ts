import CreateUser from "../../../src/core/usecases/CreateUser";
import UserRepository from "../../../src/core/dependencies/UserRepository";
import UserEntity from "../../../src/core/entities/UserEntity";
import UserEmailAlreadyRegistered from "../../../src/core/errors/UserEmailAlreadyRegistered";

const mockUserRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
};

describe("CreateUser", () => {
    let createUser: CreateUser;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        createUser = new CreateUser(mockUserRepository);
    });

    describe("exec", () => {
        it("should successfully create a new user", async () => {
            const userData = {
                name: "John",
                surname: "Doe",
                email: "john.doe@example.com",
                password: "testpassword123",
            };

            const mockCreatedUser: UserEntity = {
                id: "user-123",
                name: userData.name,
                surname: userData.surname,
                email: userData.email,
                password: "hashed-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            const result = await createUser.exec(userData);

            expect(result).toEqual({
                id: mockCreatedUser.id,
                name: mockCreatedUser.name,
                surname: mockCreatedUser.surname,
                email: mockCreatedUser.email,
                createdAt: mockDate.toISOString(),
                updatedAt: mockDate.toISOString(),
            });
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
                userData.email,
            );
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                ...userData,
                password: expect.any(String),
            });
            expect(
                mockUserRepository.create.mock.calls[0][0].password,
            ).not.toBe(userData.password);
        });

        it("should throw UserEmailAlreadyRegistered when email exists", async () => {
            const userData = {
                name: "Jane",
                surname: "Smith",
                email: "existing@example.com",
                password: "password123",
            };

            const existingUser: UserEntity = {
                id: "existing-user-123",
                name: "Existing",
                surname: "User",
                email: userData.email,
                password: "hashed-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(createUser.exec(userData)).rejects.toThrow(
                UserEmailAlreadyRegistered,
            );
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
                userData.email,
            );
            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });

        it("should hash the password before storing", async () => {
            const userData = {
                name: "Security",
                surname: "Test",
                email: "security@example.com",
                password: "plainTextPassword",
            };

            const mockCreatedUser: UserEntity = {
                id: "security-user-456",
                name: userData.name,
                surname: userData.surname,
                email: userData.email,
                password: "hashed-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            await createUser.exec(userData);

            expect(mockUserRepository.create).toHaveBeenCalledWith({
                ...userData,
                password: expect.any(String),
            });

            const createCall = mockUserRepository.create.mock.calls[0][0];
            expect(createCall.password).not.toBe(userData.password);
            expect(createCall.password).toContain(":");
        });

        it("should handle special characters in user data", async () => {
            const userData = {
                name: "José",
                surname: "García-López",
                email: "josé.garcía@subdomain.example.com",
                password: "spëcial123!@#", // Valid length
            };

            const mockCreatedUser: UserEntity = {
                id: "special-user-789",
                name: userData.name,
                surname: userData.surname,
                email: userData.email,
                password: "hashed-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            const result = await createUser.exec(userData);

            expect(result.name).toBe(userData.name);
            expect(result.surname).toBe(userData.surname);
            expect(result.email).toBe(userData.email);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
                userData.email,
            );
        });

        it("should not include password in response", async () => {
            const userData = {
                name: "Private",
                surname: "User",
                email: "private@example.com",
                password: "secretPassword123",
            };

            const mockCreatedUser: UserEntity = {
                id: "private-user-999",
                name: userData.name,
                surname: userData.surname,
                email: userData.email,
                password: "hashed-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            const result = await createUser.exec(userData);

            expect(result).not.toHaveProperty("password");
            expect(Object.keys(result)).toEqual([
                "id",
                "name",
                "surname",
                "email",
                "createdAt",
                "updatedAt",
            ]);
        });

        it("should handle case-insensitive email checking", async () => {
            const userData = {
                name: "Case",
                surname: "Test",
                email: "CaSe.TeSt@ExAmPlE.cOm",
                password: "password123",
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);

            const mockCreatedUser: UserEntity = {
                id: "case-user-111",
                name: userData.name,
                surname: userData.surname,
                email: userData.email,
                password: "hashed-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            const result = await createUser.exec(userData);

            expect(result.email).toBe(userData.email);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
                userData.email,
            );
        });
    });
});
