import React, { useState } from "react";
import { useIntl } from "react-intl";
import { UserX } from "lucide-react";

import { UserGroupRole } from "../../../../core/commons/enums";
import type UserGroupDto from "../../../../core/dtos/UserGroupDto";
import getFormattedMessageWithScope from "../../../../utils/getFormattedMessageWithScope";
import { Button } from "../../Button";
import { LoadingSpinner } from "../../LoadingSpinner";
import { Select, type SelectOption } from "../../Select";
import "./style.css";

const fm = getFormattedMessageWithScope("components.Settings.UserTable");

interface UserTableProps {
    users: UserGroupDto[] | null;
    loading: boolean;
    onRemoveUser: (userId: string) => void;
    isRemoving: boolean;
    currentUserId: string | null;
    currentUserRole?: UserGroupRole;
    onUpdateUserRole: (
        userId: string,
        role: Exclude<UserGroupRole, UserGroupRole.Owner>,
    ) => Promise<void>;
    isUpdatingRole: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
    users,
    loading,
    onRemoveUser,
    isRemoving,
    currentUserId,
    currentUserRole,
    onUpdateUserRole,
    isUpdatingRole,
}) => {
    const intl = useIntl();
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const getRemoveButtonState = (user: UserGroupDto) => {
        if (currentUserRole === UserGroupRole.Contributor) {
            return {
                disabled: true,
                title: intl.formatMessage({
                    id: "components.Settings.UserTable.contributorsCannotRemove",
                }),
            };
        }

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

    const canEditRole = (user: UserGroupDto): boolean => {
        return (
            user.userGroupRole !== UserGroupRole.Owner &&
            (currentUserRole === UserGroupRole.Owner ||
                currentUserRole === UserGroupRole.Admin)
        );
    };

    const getRoleOptions = (): SelectOption[] => {
        return [
            {
                value: UserGroupRole.Contributor,
                label: intl.formatMessage({
                    id: `components.Settings.UserTable.roles.${UserGroupRole.Contributor}`,
                }),
            },
            {
                value: UserGroupRole.Admin,
                label: intl.formatMessage({
                    id: `components.Settings.UserTable.roles.${UserGroupRole.Admin}`,
                }),
            },
        ];
    };

    const handleRoleClick = (user: UserGroupDto) => {
        if (canEditRole(user) && !isUpdatingRole) {
            setEditingUserId(user.id);
        }
    };

    const handleRoleChange = async (
        userId: string,
        newRole: Exclude<UserGroupRole, UserGroupRole.Owner>,
    ) => {
        try {
            await onUpdateUserRole(userId, newRole);
            setEditingUserId(null);
        } catch (error) {
            console.error("Error updating role:", error);
        }
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
                                const isEditable = canEditRole(user);
                                const isCurrentlyEditing =
                                    editingUserId === user.id;
                                return (
                                    <tr key={user.id}>
                                        <td title={user.name}>{user.name}</td>
                                        <td title={user.surname}>
                                            {user.surname}
                                        </td>
                                        <td title={user.email}>{user.email}</td>
                                        <td>
                                            {isCurrentlyEditing ? (
                                                <Select
                                                    value={user.userGroupRole}
                                                    options={getRoleOptions()}
                                                    onChange={(newRole) =>
                                                        handleRoleChange(
                                                            user.id,
                                                            newRole as Exclude<
                                                                UserGroupRole,
                                                                UserGroupRole.Owner
                                                            >,
                                                        )
                                                    }
                                                    className="c-settings-user-table-role-select"
                                                />
                                            ) : (
                                                <span
                                                    className={`c-settings-user-table-role ${isEditable ? "c-settings-user-table-role--editable" : ""}`}
                                                    onClick={() =>
                                                        handleRoleClick(user)
                                                    }
                                                >
                                                    {fm(
                                                        `roles.${user.userGroupRole}`,
                                                    )}
                                                </span>
                                            )}
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
