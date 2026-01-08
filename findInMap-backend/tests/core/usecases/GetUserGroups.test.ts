import { UserGroupRole } from "../../../src/core/commons/enums";
import DetailedGroupEntity from "../../../src/core/entities/DetailedGroupEntity";
import GetUserGroups from "../../../src/core/usecases/GetUserGroups";
import { mockGroupRepository } from "../../helpers";

describe("GetUserGroups", () => {
    let getUserGroups: GetUserGroups;
    const mockDate = new Date("2025-10-29T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        getUserGroups = new GetUserGroups(mockGroupRepository);
    });

    describe("exec", () => {
        it("should successfully retrieve user groups with roles", async () => {
            const userId = "user-123";

            const mockGroupsWithRole: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "My Personal Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
                {
                    group: {
                        id: "group-2",
                        name: "Shared Team Group",
                        createdBy: "another-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Contributor,
                },
            ];

            mockGroupRepository.findByUserId.mockResolvedValue(
                mockGroupsWithRole,
            );

            const result = await getUserGroups.exec(userId);

            expect(result).toEqual([
                {
                    id: "group-1",
                    name: "My Personal Group",
                    role: "owner",
                },
                {
                    id: "group-2",
                    name: "Shared Team Group",
                    role: "contributor",
                },
            ]);
            expect(mockGroupRepository.findByUserId).toHaveBeenCalledWith(
                userId,
            );
            expect(mockGroupRepository.findByUserId).toHaveBeenCalledTimes(1);
        });

        it("should return an empty array when user has no groups", async () => {
            const userId = "user-without-groups";

            mockGroupRepository.findByUserId.mockResolvedValue([]);

            const result = await getUserGroups.exec(userId);

            expect(result).toEqual([]);
            expect(mockGroupRepository.findByUserId).toHaveBeenCalledWith(
                userId,
            );
        });

        it("should handle multiple groups with different roles", async () => {
            const userId = "user-multi-role";

            const mockGroupsWithRole: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "Owner Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
                {
                    group: {
                        id: "group-2",
                        name: "Admin Group",
                        createdBy: "other-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Admin,
                },
                {
                    group: {
                        id: "group-3",
                        name: "Contributor Group",
                        createdBy: "another-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Contributor,
                },
            ];

            mockGroupRepository.findByUserId.mockResolvedValue(
                mockGroupsWithRole,
            );

            const result = await getUserGroups.exec(userId);

            expect(result).toHaveLength(3);
            expect(result[0].role).toBe("owner");
            expect(result[1].role).toBe("admin");
            expect(result[2].role).toBe("contributor");
        });
    });
});
