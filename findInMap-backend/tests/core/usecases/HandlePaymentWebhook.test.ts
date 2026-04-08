import Stripe from "stripe";

import { Plan } from "../../../src/core/commons/enums";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import HandlePaymentWebhook from "../../../src/core/usecases/HandlePaymentWebhook";

describe("HandlePaymentWebhook", () => {
    const mockGroupRepository: jest.Mocked<GroupRepository> = {
        createGroup: jest.fn(),
        findByUserId: jest.fn(),
        memoizedFindByUserId: jest.fn(),
        addUsersToGroup: jest.fn(),
        findUsersByGroupId: jest.fn(),
        removeUserFromGroup: jest.fn(),
        updateUserInGroup: jest.fn(),
        updateGroup: jest.fn(),
        addUserToGroup: jest.fn(),
        findById: jest.fn(),
        updateGroupPlan: jest.fn(),
        findPlans: jest.fn(),
        memoizedFindPlans: jest.fn(),
    };

    let usecase: HandlePaymentWebhook;

    const proPlan = {
        id: "plan-pro-id",
        name: Plan.Pro,
        maxMapPoints: 15000,
    };

    const freePlan = {
        id: "plan-free-id",
        name: Plan.Free,
        maxMapPoints: 50,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        usecase = new HandlePaymentWebhook(mockGroupRepository);
        mockGroupRepository.findPlans.mockResolvedValue([freePlan, proPlan]);
    });

    const makeCheckoutEvent = (
        metadata: Record<string, string> = {},
    ): Stripe.Event => ({
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: {
            object: {
                metadata,
                payment_status: "paid",
            } as unknown as Stripe.Checkout.Session,
        },
        object: "event",
        api_version: "2026-03-25.dahlia",
        created: Date.now(),
        livemode: false,
        pending_webhooks: 0,
        request: null,
    });

    it("should activate PRO plan for 30 days on new group", async () => {
        const event = makeCheckoutEvent({
            groupId: "group-123",
            userId: "user-123",
        });

        mockGroupRepository.findById.mockResolvedValue({
            id: "group-123",
            name: "Test Group",
            createdBy: "user-123",
            createdAt: new Date(),
            updatedAt: new Date(),
            planName: null,
            planEndDate: null,
        });

        await usecase.exec(event);

        expect(mockGroupRepository.updateGroupPlan).toHaveBeenCalledWith(
            "group-123",
            proPlan.id,
            expect.any(Date),
        );

        const planEndDate = mockGroupRepository.updateGroupPlan.mock
            .calls[0][2] as Date;
        const now = new Date();
        const diffDays = Math.round(
            (planEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        expect(diffDays).toBe(30);
    });

    it("should extend PRO plan when group already has active PRO", async () => {
        const existingEndDate = new Date();
        existingEndDate.setDate(existingEndDate.getDate() + 15);

        const event = makeCheckoutEvent({
            groupId: "group-123",
            userId: "user-123",
        });

        mockGroupRepository.findById.mockResolvedValue({
            id: "group-123",
            name: "Test Group",
            createdBy: "user-123",
            createdAt: new Date(),
            updatedAt: new Date(),
            planName: Plan.Pro,
            planEndDate: existingEndDate,
        });

        await usecase.exec(event);

        expect(mockGroupRepository.updateGroupPlan).toHaveBeenCalledWith(
            "group-123",
            proPlan.id,
            expect.any(Date),
        );

        const planEndDate = mockGroupRepository.updateGroupPlan.mock
            .calls[0][2] as Date;
        const diffFromExisting = Math.round(
            (planEndDate.getTime() - existingEndDate.getTime()) /
                (1000 * 60 * 60 * 24),
        );
        expect(diffFromExisting).toBe(30);
    });

    it("should set 30 days from now when expired PRO plan", async () => {
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 10);

        const event = makeCheckoutEvent({
            groupId: "group-123",
            userId: "user-123",
        });

        mockGroupRepository.findById.mockResolvedValue({
            id: "group-123",
            name: "Test Group",
            createdBy: "user-123",
            createdAt: new Date(),
            updatedAt: new Date(),
            planName: Plan.Pro,
            planEndDate: expiredDate,
        });

        await usecase.exec(event);

        const planEndDate = mockGroupRepository.updateGroupPlan.mock
            .calls[0][2] as Date;
        const now = new Date();
        const diffDays = Math.round(
            (planEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        expect(diffDays).toBe(30);
    });

    it("should ignore non-checkout events", async () => {
        const event = {
            ...makeCheckoutEvent({ groupId: "group-123" }),
            type: "payment_intent.succeeded",
        } as unknown as Stripe.Event;

        await usecase.exec(event);

        expect(mockGroupRepository.updateGroupPlan).not.toHaveBeenCalled();
    });

    it("should not update plan when groupId is missing from metadata", async () => {
        const event = makeCheckoutEvent({});

        await usecase.exec(event);

        expect(mockGroupRepository.updateGroupPlan).not.toHaveBeenCalled();
    });

    it("should handle group not found gracefully (new plan from now)", async () => {
        const event = makeCheckoutEvent({
            groupId: "group-123",
            userId: "user-123",
        });

        mockGroupRepository.findById.mockResolvedValue(null);

        await usecase.exec(event);

        expect(mockGroupRepository.updateGroupPlan).toHaveBeenCalledWith(
            "group-123",
            proPlan.id,
            expect.any(Date),
        );

        const planEndDate = mockGroupRepository.updateGroupPlan.mock
            .calls[0][2] as Date;
        const now = new Date();
        const diffDays = Math.round(
            (planEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        expect(diffDays).toBe(30);
    });
});
