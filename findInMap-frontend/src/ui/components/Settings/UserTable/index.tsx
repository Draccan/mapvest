import React from "react";

import type UserGroupDto from "../../../../core/dtos/UserGroupDto";
import getFormattedMessageWithScope from "../../../../utils/getFormattedMessageWithScope";
import { LoadingSpinner } from "../../LoadingSpinner";
import "./style.css";

const fm = getFormattedMessageWithScope("components.Settings.UserTable");

interface UserTableProps {
    users: UserGroupDto[] | null;
    loading: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({ users, loading }) => {
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
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.surname}</td>
                                    <td>{user.email}</td>
                                    <td>{fm(`roles.${user.userGroupRole}`)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4}>{fm("noUsers")}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};
