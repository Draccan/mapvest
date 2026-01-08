import { UserGroupRole } from "../../../src/core/commons/enums";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import UserRepository from "../../../src/core/dependencies/UserRepository";
import DetailedGroupEntity from "../../../src/core/entities/DetailedGroupEntity";
import UserEntity from "../../../src/core/entities/UserEntity";
import { UserGroupRelation } from "../../../src/core/entities/UserGroupRelation";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import GetGroupUsers from "../../../src/core/usecases/GetGroupUsers";

const mockGroupRepository: jest.Mocked<GroupRepository> = {
    findByUserId: jest.fn(),
    createGroup: jest.fn(),
    addUserToGroup: jest.fn(),
    memoizedFindByUserId: jest.fn(),
    updateGroup: jest.fn(),
    findUsersByGroupId: jest.fn(),
};

const mockUserRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    updatePassword: jest.fn(),
    createPasswordResetToken: jest.fn(),
    findPasswordResetTokenData: jest.fn(),
    deletePasswordResetToken: jest.fn(),
    deletePasswordResetTokensByUserId: jest.fn(),
};

describe("GetGroupUsers", () => {
    let getGroupUsers: GetGroupUsers;
    const mockDate = new Date("2025-10-29T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        getGroupUsers = new GetGroupUsers(
            mockGroupRepository,
            mockUserRepository,
        );
    });

    describe("exec", () => {
        it("should successfully retrieve users belonging to a group", async () => {
            const groupId = "group-123";
            const userId = "user-123";

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            const mockUserGroupRelations: UserGroupRelation[] = [
                {
                    userId: "user-123",
                    role: UserGroupRole.Owner,
                },
                {
                    userId: "user-456",
                    role: UserGroupRole.Contributor,
                },
            ];

            const mockUsers: UserEntity[] = [
                {
                    id: "user-123",
                    name: "John",
                    surname: "Doe",
                    email: "john.doe@example.com",
                    password: "hashed-password",
                    createdAt: mockDate,
                    updatedAt: mockDate,
                },
                {
                    id: "user-456",
                    name: "Jane",
                    surname: "Smith",
                    email: "jane.smith@example.com",
                    password: "hashed-password",
                    createdAt: mockDate,
                    updatedAt: mockDate,
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockGroupRepository.findUsersByGroupId.mockResolvedValue(
                mockUserGroupRelations,
            );
            mockUserRepository.findByIds.mockResolvedValue(mockUsers);

            const result = await getGroupUsers.exec(groupId, userId);

            expect(result).toEqual([
                {
                    id: "user-123",
                    name: "John",
                    surname: "Doe",
                    email: "john.doe@example.com",
                    userGroupRole: UserGroupRole.Owner,
                },
                {
                    id: "user-456",
                    name: "Jane",
                    surname: "Smith",
                    email: "jane.smith@example.com",
                    userGroupRole: UserGroupRole.Contributor,
                },
            ]);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.findUsersByGroupId).toHaveBeenCalledWith(
                groupId,
            );
            expect(mockUserRepository.findByIds).toHaveBeenCalledWith([
                "user-123",
                "user-456",
            ]);
        });

        it("should throw NotAllowedActionError when user does not have access to the group", async () => {
            const groupId = "group-123";
            const userId = "user-123";

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "different-group-id",
                        name: "Different Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );

            await expect(getGroupUsers.exec(groupId, userId)).rejects.toThrow(
                NotAllowedActionError,
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockGroupRepository.findUsersByGroupId,
            ).not.toHaveBeenCalled();
            expect(mockUserRepository.findByIds).not.toHaveBeenCalled();
        });

        it("should return empty array when group has no users", async () => {
            const groupId = "group-123";
            const userId = "user-123";

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockGroupRepository.findUsersByGroupId.mockResolvedValue([]);
            mockUserRepository.findByIds.mockResolvedValue([]);

            const result = await getGroupUsers.exec(groupId, userId);

            expect(result).toEqual([]);
            expect(mockGroupRepository.findUsersByGroupId).toHaveBeenCalledWith(
                groupId,
            );
            expect(mockUserRepository.findByIds).toHaveBeenCalledWith([]);
        });

        it("should handle users with different roles correctly", async () => {
            const groupId = "group-123";
            const userId = "user-123";

            const mockUserGroups: DetailedGroupEntity[] = [
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            const mockUserGroupRelations: UserGroupRelation[] = [
                {
                    userId: "user-123",
                    role: UserGroupRole.Owner,
                },
                {
                    userId: "user-456",
                    role: UserGroupRole.Admin,
                },
                {
                    userId: "user-789",
                    role: UserGroupRole.Contributor,
                },
            ];

            const mockUsers: UserEntity[] = [
                {
                    id: "user-123",
                    name: "Owner",
                    surname: "User",
                    email: "owner@example.com",
                    password: "hashed-password",
                    createdAt: mockDate,
                    updatedAt: mockDate,
                },
                {
                    id: "user-456",
                    name: "Admin",
                    surname: "User",
                    email: "admin@example.com",
                    password: "hashed-password",
                    createdAt: mockDate,
                    updatedAt: mockDate,
                },
                {
                    id: "user-789",
                    name: "Contributor",
                    surname: "User",
                    email: "contributor@example.com",
                    password: "hashed-password",
                    createdAt: mockDate,
                    updatedAt: mockDate,
                },
            ];

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue(
                mockUserGroups,
            );
            mockGroupRepository.findUsersByGroupId.mockResolvedValue(
                mockUserGroupRelations,
            );
            mockUserRepository.findByIds.mockResolvedValue(mockUsers);

            const result = await getGroupUsers.exec(groupId, userId);

            expect(result).toHaveLength(3);
            expect(result[0].userGroupRole).toBe(UserGroupRole.Owner);
            expect(result[1].userGroupRole).toBe(UserGroupRole.Admin);
            expect(result[2].userGroupRole).toBe(UserGroupRole.Contributor);
        });
    });
});
