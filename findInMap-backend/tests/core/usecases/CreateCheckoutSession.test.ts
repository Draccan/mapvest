import Stripe from "stripe";

import { UserGroupRole } from "../../../src/core/commons/enums";
import GroupRepository from "../../../src/core/dependencies/GroupRepository";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import CreateCheckoutSession from "../../../src/core/usecases/CreateCheckoutSession";

describe("CreateCheckoutSession", () => {
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

    const mockStripe = {
        checkout: {
            sessions: {
                create: jest.fn(),
            },
        },
    } as unknown as jest.Mocked<Stripe>;

    const proPriceId = "price_test_123";
    const frontendUrl = "http://localhost:3000";

    let usecase: CreateCheckoutSession;

    beforeEach(() => {
        jest.clearAllMocks();
        usecase = new CreateCheckoutSession(
            mockGroupRepository,
            mockStripe,
            proPriceId,
            frontendUrl,
        );
    });

    const userId = "user-123";
    const groupId = "group-123";

    const makeDetailedGroup = (
        role: UserGroupRole,
        overrides: Record<string, any> = {},
    ) => ({
        group: {
            id: groupId,
            name: "Test Group",
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            planName: null,
            planEndDate: null,
            ...overrides,
        },
        role,
    });

    it("should create a checkout session for group owner", async () => {
        mockGroupRepository.findByUserId.mockResolvedValue([
            makeDetailedGroup(UserGroupRole.Owner),
        ]);

        (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
            url: "https://checkout.stripe.com/test-session",
        });

        const result = await usecase.exec(userId, groupId);

        expect(result).toEqual({
            url: "https://checkout.stripe.com/test-session",
        });

        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
            mode: "payment",
            line_items: [{ price: proPriceId, quantity: 1 }],
            metadata: { groupId, userId },
            success_url: `${frontendUrl}/payment/success`,
            cancel_url: `${frontendUrl}/payment/cancelled`,
        });
    });

    it("should create a checkout session for admin", async () => {
        mockGroupRepository.findByUserId.mockResolvedValue([
            makeDetailedGroup(UserGroupRole.Admin),
        ]);

        (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
            url: "https://checkout.stripe.com/test-session",
        });

        const result = await usecase.exec(userId, groupId);

        expect(result).toEqual({
            url: "https://checkout.stripe.com/test-session",
        });
    });

    it("should create a checkout session for contributor", async () => {
        mockGroupRepository.findByUserId.mockResolvedValue([
            makeDetailedGroup(UserGroupRole.Contributor),
        ]);

        (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
            url: "https://checkout.stripe.com/test-session",
        });

        const result = await usecase.exec(userId, groupId);

        expect(result).toEqual({
            url: "https://checkout.stripe.com/test-session",
        });
    });

    it("should throw NotAllowedActionError when user has no access to group", async () => {
        mockGroupRepository.findByUserId.mockResolvedValue([]);

        await expect(usecase.exec(userId, groupId)).rejects.toThrow(
            NotAllowedActionError,
        );

        expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it("should throw NotAllowedActionError when group is different", async () => {
        mockGroupRepository.findByUserId.mockResolvedValue([
            makeDetailedGroup(UserGroupRole.Owner, {
                id: "different-group-id",
            }),
        ]);

        await expect(usecase.exec(userId, groupId)).rejects.toThrow(
            NotAllowedActionError,
        );

        expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it("should throw error when Stripe returns no URL", async () => {
        mockGroupRepository.findByUserId.mockResolvedValue([
            makeDetailedGroup(UserGroupRole.Owner),
        ]);

        (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
            url: null,
        });

        await expect(usecase.exec(userId, groupId)).rejects.toThrow(
            "Failed to create checkout session",
        );
    });

    it("should propagate Stripe errors", async () => {
        mockGroupRepository.findByUserId.mockResolvedValue([
            makeDetailedGroup(UserGroupRole.Owner),
        ]);

        (mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(
            new Error("Stripe API error"),
        );

        await expect(usecase.exec(userId, groupId)).rejects.toThrow(
            "Stripe API error",
        );
    });
});
