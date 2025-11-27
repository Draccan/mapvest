import CreateUser from "../../../src/core/usecases/CreateUser";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import MapRepository from "../../../src/core/dependencies/MapRepository";
import UserRepository from "../../../src/core/dependencies/UserRepository";
import GroupEntity from "../../../src/core/entities/GroupEntity";
import MapEntity from "../../../src/core/entities/MapEntity";
import UserEntity from "../../../src/core/entities/UserEntity";
import UserEmailAlreadyRegisteredError from "../../../src/core/errors/UserEmailAlreadyRegisteredError";
import { UserGroupRole } from "../../../src/core/commons/enums";

const mockUserRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
};

const mockGroupRepository: jest.Mocked<GroupRepository> = {
    findByUserId: jest.fn(),
    createGroup: jest.fn(),
    addUserToGroup: jest.fn(),
    memoizedFindByUserId: jest.fn(),
};

const mockMapRepository: jest.Mocked<MapRepository> = {
    deleteMapPoints: jest.fn(),
    createMapPoint: jest.fn(),
    findAllMapPoints: jest.fn(),
    findMapPointById: jest.fn(),
    findMapByGroupId: jest.fn(),
    memoizedFindMapByGroupId: jest.fn(),
    createMap: jest.fn(),
    createCategory: jest.fn(),
    findCategoriesByMapId: jest.fn(),
};

jest.mock("../../../src/db", () => ({
    db: {
        transaction: jest.fn((callback) =>
            callback({
                insert: jest.fn().mockReturnValue({
                    values: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([]),
                    }),
                }),
                select: jest.fn().mockReturnValue({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([]),
                    }),
                }),
            }),
        ),
    },
}));

describe("CreateUser", () => {
    let createUser: CreateUser;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        createUser = new CreateUser(
            mockUserRepository,
            mockGroupRepository,
            mockMapRepository,
        );
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

            const mockCreatedGroup: GroupEntity = {
                id: "group-123",
                name: "First Group",
                createdBy: "user-123",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            const mockCreatedMap: MapEntity = {
                id: "map-123",
                name: "First Map",
                groupId: "group-123",
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);
            mockGroupRepository.createGroup.mockResolvedValue(mockCreatedGroup);
            mockGroupRepository.addUserToGroup.mockResolvedValue();
            mockMapRepository.createMap.mockResolvedValue(mockCreatedMap);

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
            expect(mockUserRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...userData,
                    password: expect.any(String),
                }),
                expect.anything(),
            );
            expect(
                mockUserRepository.create.mock.calls[0][0].password,
            ).not.toBe(userData.password);
            expect(mockGroupRepository.createGroup).toHaveBeenCalledWith(
                "First Group",
                mockCreatedUser.id,
                expect.anything(),
            );
            expect(mockMapRepository.createMap).toHaveBeenCalledWith(
                mockCreatedGroup.id,
                { name: "First Map" },
                expect.anything(),
            );
        });

        it("should throw UserEmailAlreadyRegisteredError when email exists", async () => {
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
                UserEmailAlreadyRegisteredError,
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

            const mockCreatedGroup: GroupEntity = {
                id: "group-456",
                name: "First Group",
                createdBy: "security-user-456",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);
            mockGroupRepository.createGroup.mockResolvedValue(mockCreatedGroup);
            mockGroupRepository.addUserToGroup.mockResolvedValue();

            await createUser.exec(userData);

            expect(mockUserRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...userData,
                    password: expect.any(String),
                }),
                expect.anything(),
            );

            const createCall = mockUserRepository.create.mock.calls[0][0];
            expect(createCall.password).not.toBe(userData.password);
            expect(createCall.password).toContain(":");
        });

        it("should handle special characters in user data", async () => {
            const userData = {
                name: "José",
                surname: "García-López",
                email: "josé.garcía@subdomain.example.com",
                password: "spëcial123!@#",
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

            const mockCreatedGroup: GroupEntity = {
                id: "group-789",
                name: "First Group",
                createdBy: "special-user-789",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);
            mockGroupRepository.createGroup.mockResolvedValue(mockCreatedGroup);
            mockGroupRepository.addUserToGroup.mockResolvedValue();

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

            const mockCreatedGroup: GroupEntity = {
                id: "group-999",
                name: "First Group",
                createdBy: "private-user-999",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);
            mockGroupRepository.createGroup.mockResolvedValue(mockCreatedGroup);
            mockGroupRepository.addUserToGroup.mockResolvedValue();

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

            const mockCreatedGroup: GroupEntity = {
                id: "group-111",
                name: "First Group",
                createdBy: "case-user-111",
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            mockUserRepository.create.mockResolvedValue(mockCreatedUser);
            mockGroupRepository.createGroup.mockResolvedValue(mockCreatedGroup);
            mockGroupRepository.addUserToGroup.mockResolvedValue();

            const result = await createUser.exec(userData);

            expect(result.email).toBe(userData.email);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
                userData.email,
            );
        });
    });
});
