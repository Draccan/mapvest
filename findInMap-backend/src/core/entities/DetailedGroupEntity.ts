import { UserGroupRole } from "../commons/enums";
import GroupEntity from "./GroupEntity";

export default interface DetailedGroupEntity {
    group: GroupEntity;
    role: UserGroupRole;
}
