import { Plan } from "../../../src/core/commons/enums";
import PlanEntity from "../../../src/core/entities/PlanEntity";
import GetPlans from "../../../src/core/usecases/GetPlans";
import { mockGroupRepository } from "../../helpers";

describe("GetPlans", () => {
    let getPlans: GetPlans;

    beforeEach(() => {
        jest.clearAllMocks();
        getPlans = new GetPlans(mockGroupRepository);
    });

    describe("exec", () => {
        it("should successfully retrieve all plans", async () => {
            const mockPlans: PlanEntity[] = [
                {
                    id: "plan-1",
                    name: "free",
                    maxMapPoints: 50,
                },
                {
                    id: "plan-2",
                    name: "pro",
                    maxMapPoints: 15000,
                },
            ];

            mockGroupRepository.findPlans.mockResolvedValue(mockPlans);

            const result = await getPlans.exec();

            expect(result).toEqual([
                {
                    name: Plan.Free,
                    maxMapPoints: 50,
                },
                {
                    name: Plan.Pro,
                    maxMapPoints: 15000,
                },
            ]);
            expect(mockGroupRepository.findPlans).toHaveBeenCalledTimes(1);
        });

        it("should return an empty array when no plans exist", async () => {
            mockGroupRepository.findPlans.mockResolvedValue([]);

            const result = await getPlans.exec();

            expect(result).toEqual([]);
            expect(mockGroupRepository.findPlans).toHaveBeenCalledTimes(1);
        });

        it("should map plan entities to plan dtos without id", async () => {
            const mockPlans: PlanEntity[] = [
                {
                    id: "plan-1",
                    name: "free",
                    maxMapPoints: 50,
                },
            ];

            mockGroupRepository.findPlans.mockResolvedValue(mockPlans);

            const result = await getPlans.exec();

            expect(result).toHaveLength(1);
            expect(result[0]).not.toHaveProperty("id");
            expect(result[0]).toHaveProperty("name", Plan.Free);
            expect(result[0]).toHaveProperty("maxMapPoints", 50);
        });
    });
});
