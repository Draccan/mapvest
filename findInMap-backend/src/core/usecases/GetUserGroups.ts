import GroupRepository from "../dependencies/GroupRepository";
import GroupDto, { makeGroupDto } from "../dtos/GroupDto";

export default class GetUserGroups {
    constructor(private groupRepository: GroupRepository) {}

    async exec(userId: string): Promise<GroupDto[]> {
        const detailedGroupEntities =
            await this.groupRepository.findByUserId(userId);

        return detailedGroupEntities.map((detailedGroupEntity) =>
            makeGroupDto(detailedGroupEntity),
        );
    }
}
