import { UserGroupRole } from "../../../src/core/commons/enums";
import { db } from "../../../src/db";
import {
    users,
    groups,
    usersGroups,
    maps,
    mapPoints,
    mapCategories,
} from "../../../src/db/schema";
import { DrizzleGroupRepository } from "../../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleUserRepository } from "../../../src/dependency-implementations/DrizzleUserRepository";

describe("DrizzleGroupRepository", () => {
    let groupRepository: DrizzleGroupRepository = new DrizzleGroupRepository();
    let userRepository: DrizzleUserRepository = new DrizzleUserRepository();

    beforeEach(async () => {
        try {
            await db.delete(mapPoints);
            await db.delete(mapCategories);
            await db.delete(maps);
            await db.delete(usersGroups);
            await db.delete(groups);
            await db.delete(users);
        } catch (err) {
            console.error("Error during cleanup:", err);
        }
    });

    describe("createGroup", () => {
        it("should create a new group with owner user relationship", async () => {
            const user = await userRepository.create({
                name: "John",
                surname: "Doe",
                email: "john.doe@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "My First Group",
                user.id,
            );

            expect(group).toBeDefined();
            expect(group.id).toBeDefined();
            expect(group.name).toBe("My First Group");
            expect(group.createdBy).toBe(user.id);
            expect(group.createdAt).toBeInstanceOf(Date);
            expect(group.updatedAt).toBeInstanceOf(Date);
        });

        it("should automatically add creator to users_groups with owner role", async () => {
            const user = await userRepository.create({
                name: "Jane",
                surname: "Smith",
                email: "jane.smith@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Team Group",
                user.id,
            );

            const userGroups = await groupRepository.findByUserId(user.id);

            expect(userGroups.length).toBe(1);
            expect(userGroups[0].group.id).toBe(group.id);
            expect(userGroups[0].role).toBe(UserGroupRole.Owner);
        });

        it("should create multiple groups for the same user", async () => {
            const user = await userRepository.create({
                name: "Bob",
                surname: "Wilson",
                email: "bob1.wilson@example.com",
                password: "password123",
            });

            const group1 = await groupRepository.createGroup(
                "Group One",
                user.id,
            );
            const group2 = await groupRepository.createGroup(
                "Group Two",
                user.id,
            );

            const userGroups = await groupRepository.findByUserId(user.id);

            expect(userGroups.length).toBe(2);
            expect(userGroups.map((ug) => ug.group.id)).toContain(group1.id);
            expect(userGroups.map((ug) => ug.group.id)).toContain(group2.id);
        });
    });

    describe("addUserToGroup", () => {
        it("should add a user to a group with specified role", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const contributor = await userRepository.create({
                name: "Contributor",
                surname: "User",
                email: "contributor@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Shared Group",
                owner.id,
            );

            await groupRepository.addUserToGroup(
                contributor.id,
                group.id,
                UserGroupRole.Contributor,
            );

            const contributorGroups = await groupRepository.findByUserId(
                contributor.id,
            );

            expect(contributorGroups.length).toBe(1);
            expect(contributorGroups[0].group.id).toBe(group.id);
            expect(contributorGroups[0].role).toBe(UserGroupRole.Contributor);
        });

        it("should add user with admin role", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const admin = await userRepository.create({
                name: "Admin",
                surname: "User",
                email: "admin@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Admin Group",
                owner.id,
            );

            await groupRepository.addUserToGroup(
                admin.id,
                group.id,
                UserGroupRole.Admin,
            );

            const adminGroups = await groupRepository.findByUserId(admin.id);

            expect(adminGroups.length).toBe(1);
            expect(adminGroups[0].role).toBe(UserGroupRole.Admin);
        });

        it("should allow adding multiple users to the same group", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const user1 = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1@example.com",
                password: "password123",
            });

            const user2 = await userRepository.create({
                name: "User",
                surname: "Two",
                email: "user2@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Multi-User Group",
                owner.id,
            );

            await groupRepository.addUserToGroup(
                user1.id,
                group.id,
                UserGroupRole.Contributor,
            );

            await groupRepository.addUserToGroup(
                user2.id,
                group.id,
                UserGroupRole.Admin,
            );

            const user1Groups = await groupRepository.findByUserId(user1.id);
            const user2Groups = await groupRepository.findByUserId(user2.id);

            expect(user1Groups.length).toBe(1);
            expect(user1Groups[0].group.id).toBe(group.id);
            expect(user2Groups.length).toBe(1);
            expect(user2Groups[0].group.id).toBe(group.id);
        });
    });

    describe("findByUserId", () => {
        it("should return empty array when user has no groups", async () => {
            const user = await userRepository.create({
                name: "Lonely",
                surname: "User",
                email: "lonely@example.com",
                password: "password123",
            });

            await db.delete(usersGroups);

            const result = await groupRepository.findByUserId(user.id);

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it("should return all groups a user belongs to", async () => {
            const user = await userRepository.create({
                name: "Multi",
                surname: "Group User",
                email: "multi@example.com",
                password: "password123",
            });

            const group1 = await groupRepository.createGroup(
                "First Group",
                user.id,
            );
            const group2 = await groupRepository.createGroup(
                "Second Group",
                user.id,
            );

            const result = await groupRepository.findByUserId(user.id);

            expect(result.length).toBe(2);
            expect(result.map((r) => r.group.id)).toContain(group1.id);
            expect(result.map((r) => r.group.id)).toContain(group2.id);
        });

        it("should return groups with correct role information", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const member = await userRepository.create({
                name: "Member",
                surname: "User",
                email: "member@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Shared Group",
                owner.id,
            );

            await groupRepository.addUserToGroup(
                member.id,
                group.id,
                UserGroupRole.Contributor,
            );

            const ownerGroups = await groupRepository.findByUserId(owner.id);
            const memberGroups = await groupRepository.findByUserId(member.id);

            expect(ownerGroups[0].role).toBe(UserGroupRole.Owner);
            expect(memberGroups[0].role).toBe(UserGroupRole.Contributor);
        });

        it("should include all group fields in the response", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Complete Group",
                user.id,
            );

            const result = await groupRepository.findByUserId(user.id);

            expect(result.length).toBe(1);
            expect(result[0].group.id).toBe(group.id);
            expect(result[0].group.name).toBe("Complete Group");
            expect(result[0].group.createdBy).toBe(user.id);
            expect(result[0].group.createdAt).toBeInstanceOf(Date);
            expect(result[0].group.updatedAt).toBeInstanceOf(Date);
            expect(result[0].role).toBe(UserGroupRole.Owner);
        });

        it("should not return groups user is not a member of", async () => {
            const user1 = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1x@example.com",
                password: "password123",
            });

            const user2 = await userRepository.create({
                name: "User",
                surname: "Two",
                email: "user2y@example.com",
                password: "password123",
            });

            await groupRepository.createGroup("User 1 Group", user1.id);
            await groupRepository.createGroup("User 2 Group", user2.id);

            const user1xGroups = await groupRepository.findByUserId(user1.id);
            const user2yGroups = await groupRepository.findByUserId(user2.id);

            expect(user1xGroups.length).toBe(1);
            expect(user2yGroups.length).toBe(1);
            expect(user1xGroups[0].group.name).toBe("User 1 Group");
            expect(user2yGroups[0].group.name).toBe("User 2 Group");
        });
    });

    describe("updateGroup", () => {
        it("should update a group name successfully", async () => {
            const user = await userRepository.create({
                name: "John",
                surname: "Doe",
                email: "john.doe@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Original Name",
                user.id,
            );

            const updatedGroup = await groupRepository.updateGroup(
                group.id,
                user.id,
                { name: "Updated Name" },
            );

            expect(updatedGroup).not.toBeNull();
            expect(updatedGroup!.id).toBe(group.id);
            expect(updatedGroup!.name).toBe("Updated Name");
        });

        it("should return null when updating a non-existent group", async () => {
            const user = await userRepository.create({
                name: "John",
                surname: "Doe",
                email: "john.doe@example.com",
                password: "password123",
            });

            const updatedGroup = await groupRepository.updateGroup(
                "00000000-0000-0000-0000-000000000000",
                user.id,
                { name: "New Name" },
            );

            expect(updatedGroup).toBeNull();
        });

        it("should return null when user does not have access to the group", async () => {
            const user1 = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1@example.com",
                password: "password123",
            });

            const user2 = await userRepository.create({
                name: "User",
                surname: "Two",
                email: "user2@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "User 1 Group",
                user1.id,
            );

            const updatedGroup = await groupRepository.updateGroup(
                group.id,
                user2.id,
                { name: "Hacked Name" },
            );

            expect(updatedGroup).toBeNull();
        });
    });

    describe("findUsersByGroupId", () => {
        it("should return empty array when group has no users", async () => {
            const user = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Empty Group",
                user.id,
            );

            await db.delete(usersGroups);

            const result = await groupRepository.findUsersByGroupId(group.id);

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it("should return all users belonging to a group", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const admin = await userRepository.create({
                name: "Admin",
                surname: "User",
                email: "admin@example.com",
                password: "password123",
            });

            const contributor = await userRepository.create({
                name: "Contributor",
                surname: "User",
                email: "contributor@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Multi-User Group",
                owner.id,
            );

            await groupRepository.addUserToGroup(
                admin.id,
                group.id,
                UserGroupRole.Admin,
            );

            await groupRepository.addUserToGroup(
                contributor.id,
                group.id,
                UserGroupRole.Contributor,
            );

            const result = await groupRepository.findUsersByGroupId(group.id);

            expect(result.length).toBe(3);
            expect(result.map((r) => r.userId)).toContain(owner.id);
            expect(result.map((r) => r.userId)).toContain(admin.id);
            expect(result.map((r) => r.userId)).toContain(contributor.id);
        });

        it("should return users with correct role information", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const admin = await userRepository.create({
                name: "Admin",
                surname: "User",
                email: "admin@example.com",
                password: "password123",
            });

            const contributor = await userRepository.create({
                name: "Contributor",
                surname: "User",
                email: "contributor@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Role Test Group",
                owner.id,
            );

            await groupRepository.addUserToGroup(
                admin.id,
                group.id,
                UserGroupRole.Admin,
            );

            await groupRepository.addUserToGroup(
                contributor.id,
                group.id,
                UserGroupRole.Contributor,
            );

            const result = await groupRepository.findUsersByGroupId(group.id);

            const ownerRelation = result.find((r) => r.userId === owner.id);
            const adminRelation = result.find((r) => r.userId === admin.id);
            const contributorRelation = result.find(
                (r) => r.userId === contributor.id,
            );

            expect(ownerRelation?.role).toBe(UserGroupRole.Owner);
            expect(adminRelation?.role).toBe(UserGroupRole.Admin);
            expect(contributorRelation?.role).toBe(UserGroupRole.Contributor);
        });

        it("should only return users for the specified group", async () => {
            const user1 = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1@example.com",
                password: "password123",
            });

            const user2 = await userRepository.create({
                name: "User",
                surname: "Two",
                email: "user2@example.com",
                password: "password123",
            });

            const group1 = await groupRepository.createGroup(
                "Group 1",
                user1.id,
            );

            const group2 = await groupRepository.createGroup(
                "Group 2",
                user2.id,
            );

            const group1Users = await groupRepository.findUsersByGroupId(
                group1.id,
            );
            const group2Users = await groupRepository.findUsersByGroupId(
                group2.id,
            );

            expect(group1Users.length).toBe(1);
            expect(group2Users.length).toBe(1);
            expect(group1Users[0].userId).toBe(user1.id);
            expect(group2Users[0].userId).toBe(user2.id);
        });

        it("should return correct structure with userId and role", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Structure Test Group",
                owner.id,
            );

            const result = await groupRepository.findUsersByGroupId(group.id);

            expect(result.length).toBe(1);
            expect(result[0]).toHaveProperty("userId");
            expect(result[0]).toHaveProperty("role");
            expect(typeof result[0].userId).toBe("string");
            expect(Object.values(UserGroupRole)).toContain(result[0].role);
        });
    });

    describe("addUsersToGroup", () => {
        it("should add multiple users to a group in a single call", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const user1 = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1@example.com",
                password: "password123",
            });

            const user2 = await userRepository.create({
                name: "User",
                surname: "Two",
                email: "user2@example.com",
                password: "password123",
            });

            const user3 = await userRepository.create({
                name: "User",
                surname: "Three",
                email: "user3@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Multi-User Group",
                owner.id,
            );

            await groupRepository.addUsersToGroup(
                [user1.id, user2.id, user3.id],
                group.id,
                UserGroupRole.Contributor,
            );

            const user1Groups = await groupRepository.findByUserId(user1.id);
            const user2Groups = await groupRepository.findByUserId(user2.id);
            const user3Groups = await groupRepository.findByUserId(user3.id);

            expect(user1Groups.length).toBe(1);
            expect(user1Groups[0].group.id).toBe(group.id);
            expect(user1Groups[0].role).toBe(UserGroupRole.Contributor);

            expect(user2Groups.length).toBe(1);
            expect(user2Groups[0].group.id).toBe(group.id);
            expect(user2Groups[0].role).toBe(UserGroupRole.Contributor);

            expect(user3Groups.length).toBe(1);
            expect(user3Groups[0].group.id).toBe(group.id);
            expect(user3Groups[0].role).toBe(UserGroupRole.Contributor);
        });

        it("should add users with admin role", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const admin1 = await userRepository.create({
                name: "Admin",
                surname: "One",
                email: "admin1@example.com",
                password: "password123",
            });

            const admin2 = await userRepository.create({
                name: "Admin",
                surname: "Two",
                email: "admin2@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Admin Group",
                owner.id,
            );

            await groupRepository.addUsersToGroup(
                [admin1.id, admin2.id],
                group.id,
                UserGroupRole.Admin,
            );

            const admin1Groups = await groupRepository.findByUserId(admin1.id);
            const admin2Groups = await groupRepository.findByUserId(admin2.id);

            expect(admin1Groups[0].role).toBe(UserGroupRole.Admin);
            expect(admin2Groups[0].role).toBe(UserGroupRole.Admin);
        });

        it("should handle adding single user through addUsersToGroup", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const user = await userRepository.create({
                name: "Single",
                surname: "User",
                email: "single@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Single Add Group",
                owner.id,
            );

            await groupRepository.addUsersToGroup(
                [user.id],
                group.id,
                UserGroupRole.Contributor,
            );

            const userGroups = await groupRepository.findByUserId(user.id);

            expect(userGroups.length).toBe(1);
            expect(userGroups[0].group.id).toBe(group.id);
            expect(userGroups[0].role).toBe(UserGroupRole.Contributor);
        });

        it("should verify all users are in the group through findUsersByGroupId", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const user1 = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1@example.com",
                password: "password123",
            });

            const user2 = await userRepository.create({
                name: "User",
                surname: "Two",
                email: "user2@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Verify Group",
                owner.id,
            );

            await groupRepository.addUsersToGroup(
                [user1.id, user2.id],
                group.id,
                UserGroupRole.Contributor,
            );

            const groupUsers = await groupRepository.findUsersByGroupId(
                group.id,
            );

            expect(groupUsers.length).toBe(3);
            expect(groupUsers.map((u) => u.userId)).toContain(owner.id);
            expect(groupUsers.map((u) => u.userId)).toContain(user1.id);
            expect(groupUsers.map((u) => u.userId)).toContain(user2.id);
        });
    });

    describe("removeUserFromGroup", () => {
        it("should remove a user from a group", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const user = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                owner.id,
            );

            await groupRepository.addUserToGroup(
                user.id,
                group.id,
                UserGroupRole.Contributor,
            );

            let userGroups = await groupRepository.findByUserId(user.id);
            expect(userGroups.length).toBe(1);

            await groupRepository.removeUserFromGroup(user.id, group.id);

            userGroups = await groupRepository.findByUserId(user.id);
            expect(userGroups.length).toBe(0);
        });

        it("should not affect other users when removing one user", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const user1 = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1@example.com",
                password: "password123",
            });

            const user2 = await userRepository.create({
                name: "User",
                surname: "Two",
                email: "user2@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Multi User Group",
                owner.id,
            );

            await groupRepository.addUsersToGroup(
                [user1.id, user2.id],
                group.id,
                UserGroupRole.Contributor,
            );

            await groupRepository.removeUserFromGroup(user1.id, group.id);

            const user1Groups = await groupRepository.findByUserId(user1.id);
            const user2Groups = await groupRepository.findByUserId(user2.id);
            const groupUsers = await groupRepository.findUsersByGroupId(
                group.id,
            );

            expect(user1Groups.length).toBe(0);
            expect(user2Groups.length).toBe(1);
            expect(groupUsers.length).toBe(2);
            expect(groupUsers.map((u) => u.userId)).toContain(owner.id);
            expect(groupUsers.map((u) => u.userId)).toContain(user2.id);
            expect(groupUsers.map((u) => u.userId)).not.toContain(user1.id);
        });

        it("should do nothing if user is not in the group", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const user = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                owner.id,
            );

            await groupRepository.removeUserFromGroup(user.id, group.id);

            const groupUsers = await groupRepository.findUsersByGroupId(
                group.id,
            );
            expect(groupUsers.length).toBe(1);
            expect(groupUsers[0].userId).toBe(owner.id);
        });

        it("should remove user from specific group only", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const user = await userRepository.create({
                name: "User",
                surname: "One",
                email: "user1@example.com",
                password: "password123",
            });

            const group1 = await groupRepository.createGroup(
                "Group One",
                owner.id,
            );

            const group2 = await groupRepository.createGroup(
                "Group Two",
                owner.id,
            );

            await groupRepository.addUserToGroup(
                user.id,
                group1.id,
                UserGroupRole.Contributor,
            );

            await groupRepository.addUserToGroup(
                user.id,
                group2.id,
                UserGroupRole.Contributor,
            );

            let userGroups = await groupRepository.findByUserId(user.id);
            expect(userGroups.length).toBe(2);

            await groupRepository.removeUserFromGroup(user.id, group1.id);

            userGroups = await groupRepository.findByUserId(user.id);
            expect(userGroups.length).toBe(1);
            expect(userGroups[0].group.id).toBe(group2.id);
        });

        it("should allow removing admin user", async () => {
            const owner = await userRepository.create({
                name: "Owner",
                surname: "User",
                email: "owner@example.com",
                password: "password123",
            });

            const admin = await userRepository.create({
                name: "Admin",
                surname: "User",
                email: "admin@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                owner.id,
            );

            await groupRepository.addUserToGroup(
                admin.id,
                group.id,
                UserGroupRole.Admin,
            );

            let groupUsers = await groupRepository.findUsersByGroupId(group.id);
            expect(groupUsers.length).toBe(2);

            await groupRepository.removeUserFromGroup(admin.id, group.id);

            groupUsers = await groupRepository.findUsersByGroupId(group.id);
            expect(groupUsers.length).toBe(1);
            expect(groupUsers[0].userId).toBe(owner.id);
        });
    });
});
