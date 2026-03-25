import { AuthorizableAction, Plan } from "../../src/core/commons/enums";
import GroupEntity from "../../src/core/entities/GroupEntity";
import NotAuthorizedError from "../../src/core/errors/NotAuthorizedError";
import { UserActionsAuthorizer } from "../../src/dependency-implementations/UserActionsAuthorizer";
import { mockGroupRepository, mockMapRepository } from "../helpers";

describe("UserActionsAuthorizer", () => {
    let authorizer: UserActionsAuthorizer;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");

    beforeEach(() => {
        jest.clearAllMocks();
        authorizer = new UserActionsAuthorizer(
            mockGroupRepository,
            mockMapRepository,
        );
    });

    const makeGroup = (overrides?: Partial<GroupEntity>): GroupEntity => ({
        id: "group-id-456",
        name: "Test Group",
        createdBy: "user-id-123",
        createdAt: mockDate,
        updatedAt: mockDate,
        planName: null,
        planEndDate: null,
        ...overrides,
    });

    describe("checkAction", () => {
        it("should allow action when under the plan limit", async () => {
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([
                { id: "plan-1", name: Plan.Free, maxMapPoints: 50 },
                { id: "plan-2", name: Plan.Pro, maxMapPoints: 15000 },
            ]);
            mockMapRepository.countMapPointsByGroupId.mockResolvedValue(10);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup(),
                    { count: 1 },
                ),
            ).resolves.toBeUndefined();

            expect(mockGroupRepository.memoizedFindPlans).toHaveBeenCalled();
            expect(
                mockMapRepository.countMapPointsByGroupId,
            ).toHaveBeenCalledWith("group-id-456");
        });

        it("should throw NotAuthorizedError when exceeding the plan limit", async () => {
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([
                { id: "plan-1", name: Plan.Free, maxMapPoints: 50 },
                { id: "plan-2", name: Plan.Pro, maxMapPoints: 15000 },
            ]);
            mockMapRepository.countMapPointsByGroupId.mockResolvedValue(50);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup(),
                    { count: 1 },
                ),
            ).rejects.toThrow(NotAuthorizedError);
        });

        it("should throw NotAuthorizedError when count would exceed the limit", async () => {
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([
                { id: "plan-1", name: Plan.Free, maxMapPoints: 50 },
                { id: "plan-2", name: Plan.Pro, maxMapPoints: 15000 },
            ]);
            mockMapRepository.countMapPointsByGroupId.mockResolvedValue(45);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup(),
                    { count: 10 },
                ),
            ).rejects.toThrow(NotAuthorizedError);
        });

        it("should default count to 1 when info is not provided", async () => {
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([
                { id: "plan-1", name: Plan.Free, maxMapPoints: 50 },
            ]);
            mockMapRepository.countMapPointsByGroupId.mockResolvedValue(50);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup(),
                ),
            ).rejects.toThrow(NotAuthorizedError);
        });

        it("should default count to 1 when info.count is not provided", async () => {
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([
                { id: "plan-1", name: Plan.Free, maxMapPoints: 50 },
            ]);
            mockMapRepository.countMapPointsByGroupId.mockResolvedValue(48);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup(),
                    {},
                ),
            ).resolves.toBeUndefined();
        });

        it("should use free plan when group has no plan", async () => {
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([
                { id: "plan-1", name: Plan.Free, maxMapPoints: 50 },
                { id: "plan-2", name: Plan.Pro, maxMapPoints: 15000 },
            ]);
            mockMapRepository.countMapPointsByGroupId.mockResolvedValue(50);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup({ planName: null, planEndDate: null }),
                    { count: 1 },
                ),
            ).rejects.toThrow(NotAuthorizedError);
        });

        it("should use pro plan when group has active pro plan", async () => {
            const futureDate = new Date("2027-12-31T00:00:00.000Z");
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([
                { id: "plan-1", name: Plan.Free, maxMapPoints: 50 },
                { id: "plan-2", name: Plan.Pro, maxMapPoints: 15000 },
            ]);
            mockMapRepository.countMapPointsByGroupId.mockResolvedValue(100);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup({ planName: Plan.Pro, planEndDate: futureDate }),
                    { count: 1 },
                ),
            ).resolves.toBeUndefined();
        });

        it("should fall back to free plan when pro plan is expired", async () => {
            const pastDate = new Date("2024-01-01T00:00:00.000Z");
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([
                { id: "plan-1", name: Plan.Free, maxMapPoints: 50 },
                { id: "plan-2", name: Plan.Pro, maxMapPoints: 15000 },
            ]);
            mockMapRepository.countMapPointsByGroupId.mockResolvedValue(49);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup({ planName: Plan.Pro, planEndDate: pastDate }),
                    { count: 2 },
                ),
            ).rejects.toThrow(NotAuthorizedError);
        });

        it("should allow action at exactly the limit minus count", async () => {
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([
                { id: "plan-1", name: Plan.Free, maxMapPoints: 50 },
            ]);
            mockMapRepository.countMapPointsByGroupId.mockResolvedValue(44);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup(),
                    { count: 5 },
                ),
            ).resolves.toBeUndefined();
        });

        it("should throw NotAuthorizedError when plan is not found", async () => {
            mockGroupRepository.memoizedFindPlans.mockResolvedValue([]);

            await expect(
                authorizer.checkAction(
                    AuthorizableAction.AddMapPoints,
                    makeGroup(),
                    { count: 1 },
                ),
            ).rejects.toThrow(NotAuthorizedError);
        });
    });
});
