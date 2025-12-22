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
});
