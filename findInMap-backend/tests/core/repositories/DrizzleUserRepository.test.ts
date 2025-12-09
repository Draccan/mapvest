import CreateUserDto from "../../../src/core/dtos/CreateUserDto";
import { db } from "../../../src/db";
import {
    users,
    usersGroups,
    groups,
    maps,
    mapPoints,
    passwordResetTokens,
} from "../../../src/db/schema";
import { DrizzleUserRepository } from "../../../src/dependency-implementations/DrizzleUserRepository";

describe("DrizzleUserRepository", () => {
    let repository: DrizzleUserRepository = new DrizzleUserRepository();

    beforeEach(async () => {
        try {
            await db.delete(mapPoints);
            await db.delete(maps);
            await db.delete(usersGroups);
            await db.delete(groups);
            await db.delete(passwordResetTokens);
            await db.delete(users);
        } catch (err) {
            console.error("Error during cleanup:", err);
        }
    });

    describe("createUser", () => {
        it("should create a new user in the database", async () => {
            const createUserDto: CreateUserDto = {
                name: "John",
                surname: "Doe",
                email: `john.doe${Math.random()}@example.com`,
                password: "securePassword123",
            };

            const result = await repository.create(createUserDto);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toBe(createUserDto.name);
            expect(result.surname).toBe(createUserDto.surname);
            expect(result.email).toBe(createUserDto.email);
            expect(result.password).toBeDefined();
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
        });

        it("should throw error for duplicate email", async () => {
            const createUserDto: CreateUserDto = {
                name: "Alice",
                surname: "Johnson",
                email: `alice.johnson${Math.random()}@example.com`,
                password: "password123",
            };

            await repository.create(createUserDto);

            await expect(repository.create(createUserDto)).rejects.toThrow();
        });
    });

    describe("getUserByEmail", () => {
        it("should return user when found by email", async () => {
            const createUserDto: CreateUserDto = {
                name: "Bob",
                surname: "Wilson",
                email: `bob.wilson${Math.random()}@example.com`,
                password: "testPassword456",
            };

            const createdUser = await repository.create(createUserDto);

            const foundUser = await repository.findByEmail(createUserDto.email);

            expect(foundUser).toBeDefined();
            expect(foundUser?.id).toBe(createdUser.id);
            expect(foundUser?.email).toBe(createUserDto.email);
            expect(foundUser?.name).toBe(createUserDto.name);
            expect(foundUser?.surname).toBe(createUserDto.surname);
        });

        it("should return null when user not found", async () => {
            const result = await repository.findByEmail(
                "nonexistent@example.com",
            );
            expect(result).toBeNull();
        });

        it("should handle email case insensitivity", async () => {
            const randomNumber = Math.random();
            const createUserDto: CreateUserDto = {
                name: "Charlie",
                surname: "Brown",
                email: `charlie.brown${randomNumber}@example.com`,
                password: "password789",
            };

            await repository.create(createUserDto);

            const foundUser = await repository.findByEmail(
                `CHARLIE.BROWN${randomNumber}@EXAMPLE.COM`,
            );

            expect(foundUser).toBeDefined();
            expect(foundUser?.email).toBe(createUserDto.email);
        });
    });

    describe("findById", () => {
        it("should return user when found by id", async () => {
            const createUserDto: CreateUserDto = {
                name: "David",
                surname: "Miller",
                email: `david.miller${Math.random()}@example.com`,
                password: "testPassword789",
            };

            const createdUser = await repository.create(createUserDto);

            const foundUser = await repository.findById(createdUser.id);

            expect(foundUser).toBeDefined();
            expect(foundUser?.id).toBe(createdUser.id);
            expect(foundUser?.email).toBe(createUserDto.email);
            expect(foundUser?.name).toBe(createUserDto.name);
            expect(foundUser?.surname).toBe(createUserDto.surname);
        });

        it("should return null when user not found by id", async () => {
            const result = await repository.findById(
                "00000000-0000-0000-0000-000000000000",
            );
            expect(result).toBeNull();
        });
    });

    describe("updatePassword", () => {
        it("should successfully update user password", async () => {
            const createUserDto: CreateUserDto = {
                name: "Emma",
                surname: "Taylor",
                email: `emma.taylor${Math.random()}@example.com`,
                password: "oldPassword123",
            };

            const createdUser = await repository.create(createUserDto);
            const newHashedPassword = "newHashedPassword456:salt";

            const updatedUser = await repository.updatePassword(
                createdUser.id,
                newHashedPassword,
            );

            expect(updatedUser).toBeDefined();
            expect(updatedUser.id).toBe(createdUser.id);
            expect(updatedUser.password).toBe(newHashedPassword);
            expect(updatedUser.password).not.toBe(createdUser.password);
        });

        it("should verify password was actually updated in database", async () => {
            const createUserDto: CreateUserDto = {
                name: "Frank",
                surname: "Anderson",
                email: `frank.anderson${Math.random()}@example.com`,
                password: "initialPassword",
            };

            const createdUser = await repository.create(createUserDto);
            const newHashedPassword = "updatedHashedPassword:newsalt";

            await repository.updatePassword(createdUser.id, newHashedPassword);

            const userAfterUpdate = await repository.findById(createdUser.id);

            expect(userAfterUpdate).toBeDefined();
            expect(userAfterUpdate?.password).toBe(newHashedPassword);
        });
    });

    describe("findPasswordResetTokenData", () => {
        it("should return token data when valid token exists", async () => {
            const createUserDto: CreateUserDto = {
                name: "Grace",
                surname: "Lee",
                email: `grace.lee${Math.random()}@example.com`,
                password: "password123",
            };

            const createdUser = await repository.create(createUserDto);
            const resetToken = "test-reset-token-123";
            const expiresAt = new Date(Date.now() + 3600000);

            await db.insert(passwordResetTokens).values({
                userId: createdUser.id,
                token: resetToken,
                expiresAt,
            });

            const tokenData =
                await repository.findPasswordResetTokenData(resetToken);

            expect(tokenData).toBeDefined();
            expect(tokenData?.userId).toBe(createdUser.id);
            expect(tokenData?.expiresAt).toEqual(expiresAt);
        });

        it("should return null when token does not exist", async () => {
            const result =
                await repository.findPasswordResetTokenData(
                    "non-existent-token",
                );
            expect(result).toBeNull();
        });

        it("should return correct data for multiple tokens", async () => {
            const createUserDto1: CreateUserDto = {
                name: "Hannah",
                surname: "Martin",
                email: `hannah.martin${Math.random()}@example.com`,
                password: "password123",
            };
            const createUserDto2: CreateUserDto = {
                name: "Ian",
                surname: "Clark",
                email: `ian.clark${Math.random()}@example.com`,
                password: "password456",
            };

            const user1 = await repository.create(createUserDto1);
            const user2 = await repository.create(createUserDto2);

            const token1 = "token-user1";
            const token2 = "token-user2";
            const expiresAt1 = new Date(Date.now() + 3600000);
            const expiresAt2 = new Date(Date.now() + 7200000);

            await db.insert(passwordResetTokens).values([
                { userId: user1.id, token: token1, expiresAt: expiresAt1 },
                { userId: user2.id, token: token2, expiresAt: expiresAt2 },
            ]);

            const tokenData1 =
                await repository.findPasswordResetTokenData(token1);
            const tokenData2 =
                await repository.findPasswordResetTokenData(token2);

            expect(tokenData1?.userId).toBe(user1.id);
            expect(tokenData1?.expiresAt).toEqual(expiresAt1);
            expect(tokenData2?.userId).toBe(user2.id);
            expect(tokenData2?.expiresAt).toEqual(expiresAt2);
        });
    });

    describe("deletePasswordResetToken", () => {
        it("should successfully delete a reset token", async () => {
            const createUserDto: CreateUserDto = {
                name: "Jack",
                surname: "Robinson",
                email: `jack.robinson${Math.random()}@example.com`,
                password: "password123",
            };

            const createdUser = await repository.create(createUserDto);
            const resetToken = "token-to-delete";
            const expiresAt = new Date(Date.now() + 3600000);

            await db.insert(passwordResetTokens).values({
                userId: createdUser.id,
                token: resetToken,
                expiresAt,
            });

            const tokenBefore =
                await repository.findPasswordResetTokenData(resetToken);
            expect(tokenBefore).toBeDefined();

            await repository.deletePasswordResetToken(resetToken);

            const tokenAfter =
                await repository.findPasswordResetTokenData(resetToken);
            expect(tokenAfter).toBeNull();
        });

        it("should not throw error when deleting non-existent token", async () => {
            await expect(
                repository.deletePasswordResetToken("non-existent-token"),
            ).resolves.not.toThrow();
        });

        it("should only delete the specified token", async () => {
            const createUserDto: CreateUserDto = {
                name: "Karen",
                surname: "White",
                email: `karen.white${Math.random()}@example.com`,
                password: "password123",
            };

            const createdUser = await repository.create(createUserDto);
            const token1 = "token-to-delete";
            const token2 = "token-to-keep";
            const expiresAt = new Date(Date.now() + 3600000);

            await db.insert(passwordResetTokens).values([
                { userId: createdUser.id, token: token1, expiresAt },
                { userId: createdUser.id, token: token2, expiresAt },
            ]);

            await repository.deletePasswordResetToken(token1);

            const deletedToken =
                await repository.findPasswordResetTokenData(token1);
            const remainingToken =
                await repository.findPasswordResetTokenData(token2);

            expect(deletedToken).toBeNull();
            expect(remainingToken).toBeDefined();
            expect(remainingToken?.userId).toBe(createdUser.id);
        });
    });
});
