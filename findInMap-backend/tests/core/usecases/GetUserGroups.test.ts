import { Plan, UserGroupRole } from "../../../src/core/commons/enums";
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
                        planName: null,
                        planEndDate: null,
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
                        planName: null,
                        planEndDate: null,
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
                    plan: "free",
                },
                {
                    id: "group-2",
                    name: "Shared Team Group",
                    role: "contributor",
                    plan: "free",
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
                        planName: null,
                        planEndDate: null,
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
                        planName: null,
                        planEndDate: null,
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
                        planName: null,
                        planEndDate: null,
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

        it("should return plan free when group has no plan", async () => {
            const userId = "user-123";

            const mockGroupsWithRole: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "Free Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: null,
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            mockGroupRepository.findByUserId.mockResolvedValue(
                mockGroupsWithRole,
            );

            const result = await getUserGroups.exec(userId);

            expect(result[0].plan).toBe(Plan.Free);
        });

        it("should return plan free when group has free plan", async () => {
            const userId = "user-123";

            const mockGroupsWithRole: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "Free Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: "free",
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            mockGroupRepository.findByUserId.mockResolvedValue(
                mockGroupsWithRole,
            );

            const result = await getUserGroups.exec(userId);

            expect(result[0].plan).toBe(Plan.Free);
        });

        it("should return plan pro when group has pro plan with future end date", async () => {
            const userId = "user-123";
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);

            const mockGroupsWithRole: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "Pro Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: "pro",
                        planEndDate: futureDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            mockGroupRepository.findByUserId.mockResolvedValue(
                mockGroupsWithRole,
            );

            const result = await getUserGroups.exec(userId);

            expect(result[0].plan).toBe(Plan.Pro);
        });

        it("should return plan free when group has pro plan with past end date", async () => {
            const userId = "user-123";
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            const mockGroupsWithRole: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "Expired Pro Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: "pro",
                        planEndDate: pastDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            mockGroupRepository.findByUserId.mockResolvedValue(
                mockGroupsWithRole,
            );

            const result = await getUserGroups.exec(userId);

            expect(result[0].plan).toBe(Plan.Free);
        });

        it("should return plan free when group has pro plan but no end date", async () => {
            const userId = "user-123";

            const mockGroupsWithRole: DetailedGroupEntity[] = [
                {
                    group: {
                        id: "group-1",
                        name: "Pro No End Date Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                        planName: "pro",
                        planEndDate: null,
                    },
                    role: UserGroupRole.Owner,
                },
            ];

            mockGroupRepository.findByUserId.mockResolvedValue(
                mockGroupsWithRole,
            );

            const result = await getUserGroups.exec(userId);

            expect(result[0].plan).toBe(Plan.Free);
        });
    });
});
