import {
    hashPassword,
    verifyPassword,
} from "../../../src/core/utils/PasswordManager";

describe("PasswordManager", () => {
    describe("hashPassword", () => {
        it("should hash a password", async () => {
            const password = "testpassword123";
            const hashedPassword = await hashPassword(password);

            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe("string");
            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword.split(":")).toHaveLength(2);
        });

        it("should generate different hashes for the same password", async () => {
            const password = "samepassword";
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            expect(hash1).not.toBe(hash2);
        });

        it("should handle empty password", async () => {
            const password = "";
            const hashedPassword = await hashPassword(password);

            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe("string");
        });

        it("should handle long passwords", async () => {
            const password = "a".repeat(1000);
            const hashedPassword = await hashPassword(password);

            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe("string");
        });

        it("should handle special characters", async () => {
            const password = "päss!@#$%^&*()_+{}|:<>?[]\\;',./";
            const hashedPassword = await hashPassword(password);

            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe("string");
        });
    });

    describe("verifyPassword", () => {
        it("should verify correct password", async () => {
            const password = "correctpassword";
            const hashedPassword = await hashPassword(password);

            const isValid = await verifyPassword(password, hashedPassword);
            expect(isValid).toBe(true);
        });

        it("should reject incorrect password", async () => {
            const correctPassword = "correctpassword";
            const incorrectPassword = "wrongpassword";
            const hashedPassword = await hashPassword(correctPassword);

            const isValid = await verifyPassword(
                incorrectPassword,
                hashedPassword,
            );
            expect(isValid).toBe(false);
        });

        it("should reject password with different casing", async () => {
            const password = "TestPassword";
            const wrongCasePassword = "testpassword";
            const hashedPassword = await hashPassword(password);

            const isValid = await verifyPassword(
                wrongCasePassword,
                hashedPassword,
            );
            expect(isValid).toBe(false);
        });

        it("should handle empty password verification", async () => {
            const password = "";
            const hashedPassword = await hashPassword(password);

            let isValid = await verifyPassword("", hashedPassword);
            expect(isValid).toBe(true);

            isValid = await verifyPassword("nonempty", hashedPassword);
            expect(isValid).toBe(false);
        });

        it("should handle malformed hash", async () => {
            const password = "testpassword";
            const malformedHash = "invalid:hash:format:with:too:many:colons";

            const isValid = await verifyPassword(password, malformedHash);
            expect(isValid).toBe(false);
        });

        it("should handle hash without colon separator", async () => {
            const password = "testpassword";
            const invalidHash = "invalidhashwithoutcolon";

            const isValid = await verifyPassword(password, invalidHash);
            expect(isValid).toBe(false);
        });

        it("should handle very long passwords", async () => {
            const longPassword = "a".repeat(500);
            const hashedPassword = await hashPassword(longPassword);

            const isValid = await verifyPassword(longPassword, hashedPassword);
            expect(isValid).toBe(true);

            const isValidWrong = await verifyPassword(
                "a".repeat(499),
                hashedPassword,
            );
            expect(isValidWrong).toBe(false);
        });
    });

    describe("integration", () => {
        it("should complete hash and verify correctly", async () => {
            const testCases = [
                "simplepassword",
                "Complex!Pass123",
                "pässwördÜñîçødë",
                "",
                "a".repeat(100),
            ];

            for (const password of testCases) {
                const hashedPassword = await hashPassword(password);
                const isValid = await verifyPassword(password, hashedPassword);
                expect(isValid).toBe(true);

                const isInvalid = await verifyPassword(
                    password + "wrong",
                    hashedPassword,
                );
                expect(isInvalid).toBe(false);
            }
        });

        it("should maintain security with multiple hash/verify cycles", async () => {
            const password = "securepassword123";
            const hashes = [];

            for (let i = 0; i < 5; i++) {
                const hash = await hashPassword(password);
                hashes.push(hash);
            }

            const uniqueHashes = new Set(hashes);
            expect(uniqueHashes.size).toBe(hashes.length);

            for (const hash of hashes) {
                const isValid = await verifyPassword(password, hash);
                expect(isValid).toBe(true);
            }
        });
    });
});
