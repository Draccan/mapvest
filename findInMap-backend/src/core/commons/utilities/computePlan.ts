import { Plan } from "../enums";

export default function computePlan(
    planName: string | null,
    planEndDate: Date | null,
): Plan {
    if (!planName || planName !== Plan.Pro) return Plan.Free;
    if (!planEndDate) return Plan.Free;
    const now = new Date();
    planEndDate.setHours(23, 59, 59, 999);
    return planEndDate >= now ? Plan.Pro : Plan.Free;
}
