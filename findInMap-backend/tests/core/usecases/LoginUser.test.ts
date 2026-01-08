import UserEntity from "../../../src/core/entities/UserEntity";
import InvalidCredentialsError from "../../../src/core/errors/InvalidCredentialsError";
import LoginUser from "../../../src/core/usecases/LoginUser";
import { hashPassword } from "../../../src/core/utils/PasswordManager";
import { mockUserRepository } from "../../helpers";

const mockJwtService = {
    generateTokenPair: jest.fn(),
    verifyToken: jest.fn(),
} as any;

describe("LoginUser", () => {
    let loginUser: LoginUser;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        loginUser = new LoginUser(mockUserRepository, mockJwtService);
    });

    describe("exec", () => {
        it("should successfully login with valid credentials", async () => {
            const email = "test@example.com";
            const password = "testpassword123";
            const hashedPassword = await hashPassword(password);
            const mockUser: UserEntity = {
                id: "user-123",
                name: "John",
                surname: "Doe",
                email,
                password: hashedPassword,
                createdAt: mockDate,
                updatedAt: mockDate,
            };
            const mockTokenPair = {
                accessToken: "jwt-access-token-123",
                refreshToken: "jwt-refresh-token-456",
            };

            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockJwtService.generateTokenPair.mockReturnValue(mockTokenPair);

            const result = await loginUser.exec({ email, password });

            expect(result).toEqual({
                token: mockTokenPair.accessToken,
                refreshToken: mockTokenPair.refreshToken,
                user: {
                    id: mockUser.id,
                    name: mockUser.name,
                    surname: mockUser.surname,
                    email: mockUser.email,
                },
            });
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockJwtService.generateTokenPair).toHaveBeenCalledWith({
                userId: mockUser.id,
                email: mockUser.email,
            });
        });

        it("should throw InvalidCredentialsError when user not found", async () => {
            const email = "nonexistent@example.com";
            const password = "testpassword123";

            mockUserRepository.findByEmail.mockResolvedValue(null);

            await expect(loginUser.exec({ email, password })).rejects.toThrow(
                InvalidCredentialsError,
            );
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockJwtService.generateTokenPair).not.toHaveBeenCalled();
        });

        it("should throw InvalidCredentialsError when password is incorrect", async () => {
            const email = "test@example.com";
            const correctPassword = "correctpassword";
            const incorrectPassword = "wrongpassword";
            const hashedPassword = await hashPassword(correctPassword);
            const mockUser: UserEntity = {
                id: "user-123",
                name: "John",
                surname: "Doe",
                email,
                password: hashedPassword,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            await expect(
                loginUser.exec({ email, password: incorrectPassword }),
            ).rejects.toThrow(InvalidCredentialsError);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockJwtService.generateTokenPair).not.toHaveBeenCalled();
        });

        it("should handle empty email", async () => {
            const email = "";
            const password = "testpassword123";

            mockUserRepository.findByEmail.mockResolvedValue(null);

            await expect(loginUser.exec({ email, password })).rejects.toThrow(
                InvalidCredentialsError,
            );
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
        });

        it("should not include password in response", async () => {
            const email = "secure@example.com";
            const password = "testpassword123";
            const hashedPassword = await hashPassword(password);
            const mockUser: UserEntity = {
                id: "secure-user-789",
                name: "Security",
                surname: "User",
                email,
                password: hashedPassword,
                createdAt: mockDate,
                updatedAt: mockDate,
            };
            const mockTokenPair = {
                accessToken: "secure-jwt-access-token",
                refreshToken: "secure-jwt-refresh-token",
            };

            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockJwtService.generateTokenPair.mockReturnValue(mockTokenPair);

            const result = await loginUser.exec({ email, password });

            expect(result.user).not.toHaveProperty("password");
            expect(result.user).toEqual({
                id: mockUser.id,
                name: mockUser.name,
                surname: mockUser.surname,
                email: mockUser.email,
            });
        });
    });
});
