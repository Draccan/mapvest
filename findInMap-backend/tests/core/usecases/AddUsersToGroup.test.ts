import { UserGroupRole } from "../../../src/core/commons/enums";
import AddUsersToGroup from "../../../src/core/usecases/AddUsersToGroup";
import { mockGroupRepository, mockUserRepository } from "../../helpers";

describe("AddUsersToGroup", () => {
    const usecase = new AddUsersToGroup(
        mockGroupRepository,
        mockUserRepository,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("exec", () => {
        it("should add users to group successfully when user is owner", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userEmails: ["user1@example.com", "user2@example.com"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockUserRepository.findByEmails.mockResolvedValue([
                {
                    id: "new-user-1",
                    email: "user1@example.com",
                    name: "User",
                    surname: "One",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "new-user-2",
                    email: "user2@example.com",
                    name: "User",
                    surname: "Two",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.findByEmails).toHaveBeenCalledWith(
                data.userEmails,
            );
            expect(mockGroupRepository.addUsersToGroup).toHaveBeenCalledWith(
                ["new-user-1", "new-user-2"],
                groupId,
                UserGroupRole.Contributor,
            );
        });

        it("should add users to group successfully when user is admin", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userEmails: ["user1@example.com", "user2@example.com"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "owner-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockUserRepository.findByEmails.mockResolvedValue([
                {
                    id: "new-user-1",
                    email: "user1@example.com",
                    name: "User",
                    surname: "One",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "new-user-2",
                    email: "user2@example.com",
                    name: "User",
                    surname: "Two",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.findByEmails).toHaveBeenCalledWith(
                data.userEmails,
            );
            expect(mockGroupRepository.addUsersToGroup).toHaveBeenCalledWith(
                ["new-user-1", "new-user-2"],
                groupId,
                UserGroupRole.Contributor,
            );
        });

        it("should throw NotAllowedActionError when user does not have access to group", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userEmails: ["user1@example.com", "user2@example.com"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: "different-group-id",
                        name: "Different Group",
                        createdBy: "other-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            await expect(usecase.exec(userId, groupId, data)).rejects.toThrow(
                "User cannot access this group",
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.findByEmails).not.toHaveBeenCalled();
            expect(mockGroupRepository.addUsersToGroup).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when user is contributor", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userEmails: ["user1@example.com", "user2@example.com"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "owner-user",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Contributor,
                },
            ]);

            await expect(usecase.exec(userId, groupId, data)).rejects.toThrow(
                "User must be owner or admin to add users to group",
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.findByEmails).not.toHaveBeenCalled();
            expect(mockGroupRepository.addUsersToGroup).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when user has no groups", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userEmails: ["user1@example.com", "user2@example.com"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

            await expect(usecase.exec(userId, groupId, data)).rejects.toThrow(
                "User cannot access this group",
            );

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.findByEmails).not.toHaveBeenCalled();
            expect(mockGroupRepository.addUsersToGroup).not.toHaveBeenCalled();
        });

        it("should add single user to group", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userEmails: ["user1@example.com"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockUserRepository.findByEmails.mockResolvedValue([
                {
                    id: "new-user-1",
                    email: "user1@example.com",
                    name: "User",
                    surname: "One",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.addUsersToGroup).toHaveBeenCalledWith(
                ["new-user-1"],
                groupId,
                UserGroupRole.Contributor,
            );
        });

        it("should add multiple users to group", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userEmails: [
                    "user1@example.com",
                    "user2@example.com",
                    "user3@example.com",
                    "user4@example.com",
                ],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockUserRepository.findByEmails.mockResolvedValue([
                {
                    id: "user-1",
                    email: "user1@example.com",
                    name: "User",
                    surname: "One",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "user-2",
                    email: "user2@example.com",
                    name: "User",
                    surname: "Two",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "user-3",
                    email: "user3@example.com",
                    name: "User",
                    surname: "Three",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "user-4",
                    email: "user4@example.com",
                    name: "User",
                    surname: "Four",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockGroupRepository.addUsersToGroup).toHaveBeenCalledWith(
                ["user-1", "user-2", "user-3", "user-4"],
                groupId,
                UserGroupRole.Contributor,
            );
        });

        it("should verify added users get contributor role", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userEmails: ["user1@example.com", "user2@example.com"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockUserRepository.findByEmails.mockResolvedValue([
                {
                    id: "new-user-1",
                    email: "user1@example.com",
                    name: "User",
                    surname: "One",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "new-user-2",
                    email: "user2@example.com",
                    name: "User",
                    surname: "Two",
                    password: "hashed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            mockGroupRepository.addUsersToGroup.mockResolvedValue(undefined);

            await usecase.exec(userId, groupId, data);

            const addUsersToGroupCalls =
                mockGroupRepository.addUsersToGroup.mock.calls;
            expect(addUsersToGroupCalls.length).toBe(1);
            expect(addUsersToGroupCalls[0][2]).toBe(UserGroupRole.Contributor);
        });

        it("should not add users when emails do not exist", async () => {
            const userId = "user-123";
            const groupId = "group-456";
            const data = {
                userEmails: ["nonexistent@example.com"],
            };

            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockUserRepository.findByEmails.mockResolvedValue([]);

            await usecase.exec(userId, groupId, data);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(mockUserRepository.findByEmails).toHaveBeenCalledWith(
                data.userEmails,
            );
            expect(mockGroupRepository.addUsersToGroup).not.toHaveBeenCalled();
        });
    });
});
