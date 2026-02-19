export default interface GroupEntity {
    id: string;
    name: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    planName: string | null;
    planEndDate: Date | null;
}
