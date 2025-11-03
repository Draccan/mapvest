import CreateUserDto from "../../../src/core/dtos/CreateUserDto";
import { db } from "../../../src/db";
import {
    users,
    usersGroups,
    groups,
    maps,
    mapPoints,
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
});
