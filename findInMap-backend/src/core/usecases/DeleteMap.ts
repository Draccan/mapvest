import { UserGroupRole } from "../commons/enums";
import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class DeleteMap {
    constructor(
        private groupRepository: GroupRepository,
        private mapRepository: MapRepository,
    ) {}

    async exec(mapId: string, groupId: string, userId: string): Promise<void> {
        const groups = await this.groupRepository.memoizedFindByUserId(userId);
        const userGroup = groups.find((group) => group.group.id === groupId);

        if (userGroup === undefined) {
            throw new NotAllowedActionError(
                "User cannot access map for this group",
            );
        }

        const maps = await this.mapRepository.memoizedFindMapByGroupId(groupId);
        if (maps.find((map) => map.id === mapId) === undefined) {
            throw new NotAllowedActionError(
                "This group has no access to the specified map",
            );
        }

        if (
            userGroup.role !== UserGroupRole.Owner &&
            userGroup.role !== UserGroupRole.Admin
        ) {
            throw new NotAllowedActionError(
                "Only owners and admins can delete maps",
            );
        }

        await this.mapRepository.deleteMap(mapId);
    }
}
