import { AuthorizableAction } from "../commons/enums";
import GroupEntity from "../entities/GroupEntity";

export default interface Authorizer {
    checkAction(
        action: AuthorizableAction,
        group: GroupEntity,
        info?: { count?: number },
    ): Promise<void>;
}
