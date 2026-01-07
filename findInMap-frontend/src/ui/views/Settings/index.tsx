import React from "react";

import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Header } from "../../components/Header";
import { ThemeToggle } from "../../components/ThemeToggle";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Settings");

export const Settings: React.FC = () => {
    const { selectedGroup } = useGroupsMaps();
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
                                <tr>
                                    <td>TODO</td>
                                    <td>TODO</td>
                                    <td>TODO</td>
                                    <td>TODO</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
