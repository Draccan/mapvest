import React from "react";
import { useIntl } from "react-intl";
import { UserX } from "lucide-react";

import { UserGroupRole } from "../../../../core/commons/enums";
import type UserGroupDto from "../../../../core/dtos/UserGroupDto";
import getFormattedMessageWithScope from "../../../../utils/getFormattedMessageWithScope";
import { Button } from "../../Button";
import { LoadingSpinner } from "../../LoadingSpinner";
import "./style.css";

const fm = getFormattedMessageWithScope("components.Settings.UserTable");

interface UserTableProps {
    users: UserGroupDto[] | null;
    loading: boolean;
    onRemoveUser: (userId: string) => void;
    isRemoving: boolean;
    currentUserId: string | null;
}

export const UserTable: React.FC<UserTableProps> = ({
    users,
    loading,
    onRemoveUser,
    isRemoving,
    currentUserId,
}) => {
    const intl = useIntl();

    const getRemoveButtonState = (user: UserGroupDto) => {
        if (user.id === currentUserId) {
            return {
                disabled: true,
                title: intl.formatMessage({
                    id: "components.Settings.UserTable.cannotRemoveSelf",
                }),
            };
        }

        if (user.userGroupRole === UserGroupRole.Owner) {
            const ownerCount =
                users?.filter((u) => u.userGroupRole === UserGroupRole.Owner)
                    .length || 0;

            if (ownerCount <= 1) {
                return {
                    disabled: true,
                    title: intl.formatMessage({
                        id: "components.Settings.UserTable.cannotRemoveLastOwner",
                    }),
                };
            }
        }

        return {
            disabled: isRemoving,
            loading: isRemoving,
            title: intl.formatMessage({
                id: "components.Settings.UserTable.removeUser",
            }),
        };
    };

    return (
        <div className="c-settings-user-table-wrapper">
            {loading ? (
                <div className="c-settings-user-table-loading">
                    <LoadingSpinner />
                </div>
            ) : (
                <table className="c-settings-user-table">
                    <thead>
                        <tr>
                            <th>{fm("name")}</th>
                            <th>{fm("surname")}</th>
                            <th>{fm("email")}</th>
                            <th>{fm("role")}</th>
                            <th>{fm("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map((user) => {
                                const buttonState = getRemoveButtonState(user);
                                return (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.surname}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {fm(`roles.${user.userGroupRole}`)}
                                        </td>
                                        <td>
                                            <Button
                                                onClick={() =>
                                                    onRemoveUser(user.id)
                                                }
                                                disabled={
                                                    buttonState.disabled ||
                                                    buttonState.loading
                                                }
                                                loading={buttonState.loading}
                                                kind="danger"
                                                size="icon"
                                                fullWidth={false}
                                                title={buttonState.title}
                                                aria-label={buttonState.title}
                                            >
                                                <UserX size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5}>{fm("noUsers")}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};
