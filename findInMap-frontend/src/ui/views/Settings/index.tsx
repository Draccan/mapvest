import React, { useEffect } from "react";

import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import { useGetGroupUsers } from "../../../core/usecases/useGetGroupUsers";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Header } from "../../components/Header";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ThemeToggle } from "../../components/ThemeToggle";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Settings");

export const Settings: React.FC = () => {
    const { selectedGroup } = useGroupsMaps();
    const {
        data: groupUsers,
        loading,
        fetch: fetchGroupUsers,
        hasFetched,
        error,
    } = useGetGroupUsers();

    useEffect(() => {
        if (selectedGroup?.id && !loading && !hasFetched && !error) {
            fetchGroupUsers(selectedGroup.id);
        }
    }, [selectedGroup?.id, loading, hasFetched, error]);

    return (
        <div className="v-settings">
            <ThemeToggle className="v-settings-theme-toggle" />
            <div className="v-settings-container">
                <Header />
                <div className="v-settings-main">
                    <h1 className="v-settings-title">{fm("title")}</h1>
                    <div className="v-settings-group">
                        <span className="v-settings-group-label">
                            {fm("group")}
                        </span>
                        <span className="v-settings-group-name">
                            {selectedGroup?.name || "TODO"}
                        </span>
                    </div>
                    <div className="v-settings-table-wrapper">
                        {loading ? (
                            <div className="v-settings-loading">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <table className="v-settings-table">
                                <thead>
                                    <tr>
                                        <th>{fm("table.name")}</th>
                                        <th>{fm("table.surname")}</th>
                                        <th>{fm("table.email")}</th>
                                        <th>{fm("table.role")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupUsers && groupUsers.length > 0 ? (
                                        groupUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.name}</td>
                                                <td>{user.surname}</td>
                                                <td>{user.email}</td>
                                                <td>{user.userGroupRole}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4}>
                                                {fm("table.noUsers")}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
