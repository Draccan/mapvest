import UpdateUser from "../../../src/core/usecases/UpdateUser";
import UserRepository from "../../../src/core/dependencies/UserRepository";
import UserEntity from "../../../src/core/entities/UserEntity";
import IncorrectPasswordError from "../../../src/core/errors/IncorrectPasswordError";
import InvalidPasswordError from "../../../src/core/errors/InvalidPasswordError";
import { hashPassword } from "../../../src/core/utils/PasswordManager";

const mockUserRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePassword: jest.fn(),
};

describe("UpdateUser", () => {
    let updateUserPassword: UpdateUser;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        updateUserPassword = new UpdateUser(mockUserRepository);
    });

    describe("exec", () => {
        it("should successfully update user password", async () => {
            const userId = "user-123";
            const currentPassword = "oldPassword123";
            const newPassword = "newPassword456";
            const hashedOldPassword = await hashPassword(currentPassword);

            const mockUser: UserEntity = {
                id: userId,
                name: "John",
                surname: "Doe",
                email: "john@example.com",
                password: hashedOldPassword,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            const mockUpdatedUser: UserEntity = {
                ...mockUser,
                password: "new-hashed-password",
                updatedAt: new Date(),
            };

            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockUserRepository.updatePassword.mockResolvedValue(
                mockUpdatedUser,
            );

            await updateUserPassword.exec(userId, {
                currentPassword,
                newPassword,
            });

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
                userId,
                expect.any(String),
            );
            const updateCall = mockUserRepository.updatePassword.mock.calls[0];
            expect(updateCall[1]).not.toBe(newPassword);
            expect(updateCall[1]).toContain(":");
        });

        it("should throw IncorrectPasswordError when current password is wrong", async () => {
            const userId = "user-123";
            const currentPassword = "wrongPassword";
            const newPassword = "newPassword456";
            const hashedCorrectPassword = await hashPassword("correctPassword");

            const mockUser: UserEntity = {
                id: userId,
                name: "John",
                surname: "Doe",
                email: "john@example.com",
                password: hashedCorrectPassword,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findById.mockResolvedValue(mockUser);

            await expect(
                updateUserPassword.exec(userId, {
                    currentPassword,
                    newPassword,
                }),
            ).rejects.toThrow(IncorrectPasswordError);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
        });

        it("should throw error when user not found", async () => {
            const userId = "non-existent-user";
            const currentPassword = "somePassword";
            const newPassword = "newPassword456";

            mockUserRepository.findById.mockResolvedValue(null);

            await expect(
                updateUserPassword.exec(userId, {
                    currentPassword,
                    newPassword,
                }),
            ).rejects.toThrow("User not found");

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
        });

        it("should throw InvalidPasswordError when new password is too short", async () => {
            const userId = "user-123";
            const currentPassword = "oldPassword123";
            const newPassword = "short";
            const hashedOldPassword = await hashPassword(currentPassword);

            const mockUser: UserEntity = {
                id: userId,
                name: "John",
                surname: "Doe",
                email: "john@example.com",
                password: hashedOldPassword,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findById.mockResolvedValue(mockUser);

            await expect(
                updateUserPassword.exec(userId, {
                    currentPassword,
                    newPassword,
                }),
            ).rejects.toThrow(InvalidPasswordError);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
        });

        it("should throw InvalidPasswordError when new password is too long", async () => {
            const userId = "user-123";
            const currentPassword = "oldPassword123";
            const newPassword = "a".repeat(21);
            const hashedOldPassword = await hashPassword(currentPassword);

            const mockUser: UserEntity = {
                id: userId,
                name: "John",
                surname: "Doe",
                email: "john@example.com",
                password: hashedOldPassword,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findById.mockResolvedValue(mockUser);

            await expect(
                updateUserPassword.exec(userId, {
                    currentPassword,
                    newPassword,
                }),
            ).rejects.toThrow(InvalidPasswordError);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
        });

        it("should hash the new password before updating", async () => {
            const userId = "user-123";
            const currentPassword = "oldPassword123";
            const newPassword = "newPassword456";
            const hashedOldPassword = await hashPassword(currentPassword);

            const mockUser: UserEntity = {
                id: userId,
                name: "John",
                surname: "Doe",
                email: "john@example.com",
                password: hashedOldPassword,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            const mockUpdatedUser: UserEntity = {
                ...mockUser,
                password: "new-hashed-password",
                updatedAt: new Date(),
            };

            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockUserRepository.updatePassword.mockResolvedValue(
                mockUpdatedUser,
            );

            await updateUserPassword.exec(userId, {
                currentPassword,
                newPassword,
            });

            const updateCall = mockUserRepository.updatePassword.mock.calls[0];
            expect(updateCall[1]).not.toBe(newPassword);
            expect(updateCall[1]).toContain(":");
            expect(updateCall[1].split(":")).toHaveLength(2);
        });

        it("should handle special characters in passwords", async () => {
            const userId = "user-123";
            const currentPassword = "p@ssw0rd!#$%";
            const newPassword = "n3wP@ss!@#$%";
            const hashedOldPassword = await hashPassword(currentPassword);

            const mockUser: UserEntity = {
                id: userId,
                name: "John",
                surname: "Doe",
                email: "john@example.com",
                password: hashedOldPassword,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            const mockUpdatedUser: UserEntity = {
                ...mockUser,
                password: "new-hashed-password",
                updatedAt: new Date(),
            };

            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockUserRepository.updatePassword.mockResolvedValue(
                mockUpdatedUser,
            );

            await updateUserPassword.exec(userId, {
                currentPassword,
                newPassword,
            });

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
                userId,
                expect.any(String),
            );
        });
    });
});
