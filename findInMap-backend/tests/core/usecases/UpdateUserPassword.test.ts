import UpdateUserPassword from "../../../src/core/usecases/UpdateUserPassword";
import InvalidResetTokenError from "../../../src/core/errors/InvalidResetTokenError";
import InvalidPasswordError from "../../../src/core/errors/InvalidPasswordError";
import { mockUserRepository } from "../../helpers";

describe("UpdateUserPassword", () => {
    let updateUserPassword: UpdateUserPassword;
    const mockDate = new Date("2025-12-09T12:00:00.000Z");
    const futureDate = new Date("2025-12-09T13:00:00.000Z");
    const pastDate = new Date("2025-12-09T11:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        updateUserPassword = new UpdateUserPassword(mockUserRepository);
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("exec", () => {
        it("should successfully update password with valid reset token", async () => {
            const resetToken = "valid-reset-token";
            const newPassword = "newPassword123";
            const userId = "user-123";

            mockUserRepository.findPasswordResetTokenData.mockResolvedValue({
                id: "token-id-123",
                userId,
                token: resetToken,
                expiresAt: futureDate,
                createdAt: mockDate,
            });
            mockUserRepository.updatePassword.mockResolvedValue({
                id: userId,
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "hashed-new-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            });
            mockUserRepository.deletePasswordResetToken.mockResolvedValue(
                undefined,
            );

            await updateUserPassword.exec({
                resetToken,
                password: newPassword,
            });

            expect(
                mockUserRepository.findPasswordResetTokenData,
            ).toHaveBeenCalledWith(resetToken);
            expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
                userId,
                expect.any(String),
            );
            expect(
                mockUserRepository.deletePasswordResetToken,
            ).toHaveBeenCalledWith(resetToken);

            const updateCall = mockUserRepository.updatePassword.mock.calls[0];
            expect(updateCall[1]).not.toBe(newPassword);
            expect(updateCall[1]).toContain(":");
        });

        it("should throw InvalidResetTokenError when token does not exist", async () => {
            const resetToken = "non-existent-token";
            const newPassword = "newPassword123";

            mockUserRepository.findPasswordResetTokenData.mockResolvedValue(
                null,
            );

            await expect(
                updateUserPassword.exec({ resetToken, password: newPassword }),
            ).rejects.toThrow(InvalidResetTokenError);

            expect(
                mockUserRepository.findPasswordResetTokenData,
            ).toHaveBeenCalledWith(resetToken);
            expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
            expect(
                mockUserRepository.deletePasswordResetToken,
            ).not.toHaveBeenCalled();
        });

        it("should throw InvalidResetTokenError when token is expired", async () => {
            const resetToken = "expired-token";
            const newPassword = "newPassword123";
            const userId = "user-123";

            mockUserRepository.findPasswordResetTokenData.mockResolvedValue({
                id: "token-id-456",
                userId,
                token: resetToken,
                expiresAt: pastDate,
                createdAt: mockDate,
            });
            mockUserRepository.deletePasswordResetToken.mockResolvedValue(
                undefined,
            );

            await expect(
                updateUserPassword.exec({ resetToken, password: newPassword }),
            ).rejects.toThrow(InvalidResetTokenError);

            expect(
                mockUserRepository.findPasswordResetTokenData,
            ).toHaveBeenCalledWith(resetToken);
            expect(
                mockUserRepository.deletePasswordResetToken,
            ).toHaveBeenCalledWith(resetToken);
            expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
        });

        it("should throw InvalidPasswordError when password is too short", async () => {
            const resetToken = "valid-token";
            const newPassword = "short";

            await expect(
                updateUserPassword.exec({ resetToken, password: newPassword }),
            ).rejects.toThrow(InvalidPasswordError);

            expect(
                mockUserRepository.findPasswordResetTokenData,
            ).not.toHaveBeenCalled();
            expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
            expect(
                mockUserRepository.deletePasswordResetToken,
            ).not.toHaveBeenCalled();
        });

        it("should throw InvalidPasswordError when password is too long", async () => {
            const resetToken = "valid-token";
            const newPassword = "a".repeat(21);

            await expect(
                updateUserPassword.exec({ resetToken, password: newPassword }),
            ).rejects.toThrow(InvalidPasswordError);

            expect(
                mockUserRepository.findPasswordResetTokenData,
            ).not.toHaveBeenCalled();
            expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
            expect(
                mockUserRepository.deletePasswordResetToken,
            ).not.toHaveBeenCalled();
        });

        it("should hash the password before updating", async () => {
            const resetToken = "valid-token";
            const newPassword = "plainPassword123";
            const userId = "user-123";

            mockUserRepository.findPasswordResetTokenData.mockResolvedValue({
                id: "token-id-789",
                userId,
                token: resetToken,
                expiresAt: futureDate,
                createdAt: mockDate,
            });
            mockUserRepository.updatePassword.mockResolvedValue({
                id: userId,
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "hashed-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            });
            mockUserRepository.deletePasswordResetToken.mockResolvedValue(
                undefined,
            );

            await updateUserPassword.exec({
                resetToken,
                password: newPassword,
            });

            const updateCall = mockUserRepository.updatePassword.mock.calls[0];
            expect(updateCall[1]).not.toBe(newPassword);
            expect(updateCall[1]).toContain(":");
            expect(updateCall[1].split(":")).toHaveLength(2);
        });

        it("should delete token after successful password update", async () => {
            const resetToken = "valid-token";
            const newPassword = "newPassword123";
            const userId = "user-123";

            mockUserRepository.findPasswordResetTokenData.mockResolvedValue({
                id: "token-id-101",
                userId,
                token: resetToken,
                expiresAt: futureDate,
                createdAt: mockDate,
            });
            mockUserRepository.updatePassword.mockResolvedValue({
                id: userId,
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "hashed-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            });
            mockUserRepository.deletePasswordResetToken.mockResolvedValue(
                undefined,
            );

            await updateUserPassword.exec({
                resetToken,
                password: newPassword,
            });

            expect(
                mockUserRepository.deletePasswordResetToken,
            ).toHaveBeenCalledWith(resetToken);
            expect(
                mockUserRepository.deletePasswordResetToken,
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle special characters in password", async () => {
            const resetToken = "valid-token";
            const newPassword = "P@ssw0rd!#$%";
            const userId = "user-123";

            mockUserRepository.findPasswordResetTokenData.mockResolvedValue({
                id: "token-id-202",
                userId,
                token: resetToken,
                expiresAt: futureDate,
                createdAt: mockDate,
            });
            mockUserRepository.updatePassword.mockResolvedValue({
                id: userId,
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "hashed-password",
                createdAt: mockDate,
                updatedAt: mockDate,
            });
            mockUserRepository.deletePasswordResetToken.mockResolvedValue(
                undefined,
            );

            await updateUserPassword.exec({
                resetToken,
                password: newPassword,
            });

            expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
                userId,
                expect.any(String),
            );
        });
    });
});
