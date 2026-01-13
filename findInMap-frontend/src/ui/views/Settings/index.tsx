import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useIntl } from "react-intl";

import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import { useAddUsersToGroup } from "../../../core/usecases/useAddUsersToGroup";
import { useGetGroupUsers } from "../../../core/usecases/useGetGroupUsers";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Modal } from "../../components/Modal";
import { ThemeToggle } from "../../components/ThemeToggle";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Settings");

export const Settings: React.FC = () => {
    const intl = useIntl();
    const { selectedGroup } = useGroupsMaps();
    const {
        data: groupUsers,
        loading,
        fetch: fetchGroupUsers,
        hasFetched,
        error,
    } = useGetGroupUsers();
    const { addUsersToGroup, loading: isAddingUser } = useAddUsersToGroup();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    useEffect(() => {
        if (selectedGroup?.id && !loading && !hasFetched && !error) {
            fetchGroupUsers(selectedGroup.id);
        }
    }, [selectedGroup?.id, loading, hasFetched, error]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const toggleAddUserModal = () => {
        setIsModalOpen(!isModalOpen);
        setUserEmail("");
        setEmailError("");
    };

    const handleAddUser = async () => {
        if (!userEmail.trim() || !validateEmail(userEmail)) {
            setEmailError(
                intl.formatMessage({
                    id: "views.Settings.addUserModal.invalidEmail",
                }),
            );
            return;
        }

        try {
            await addUsersToGroup(selectedGroup!.id, [userEmail]);
            toast.success(
                intl.formatMessage({
                    id: "views.Settings.addUserModal.successMessage",
                }),
            );
            toggleAddUserModal();
            fetchGroupUsers(selectedGroup!.id);
        } catch (err) {
            console.error("Error adding user:", err);
        }
    };

    return (
        <div className="v-settings">
            <ThemeToggle className="v-settings-theme-toggle" />
            <div className="v-settings-container">
                <Header />
                <div className="v-settings-main">
                    <h1 className="v-settings-title">{fm("title")}</h1>
                    <div className="v-settings-group-row">
                        <div className="v-settings-group">
                            <span className="v-settings-group-label">
                                {fm("group")}
                            </span>
                            <span className="v-settings-group-name">
                                {selectedGroup?.name}
                            </span>
                        </div>
                        <Button
                            onClick={toggleAddUserModal}
                            className="v-settings-add-user-button"
                            fullWidth={false}
                        >
                            {fm("addUser")}
                        </Button>
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
                                                <td>
                                                    {fm(
                                                        `table.roles.${user.userGroupRole}`,
                                                    )}
                                                </td>
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
            <Modal
                isOpen={isModalOpen}
                onClose={toggleAddUserModal}
                isCloseDisabled={isAddingUser}
            >
                <div className="v-settings-modal">
                    <h2 className="v-settings-modal-title">
                        {fm("addUserModal.title")}
                    </h2>
                    <div className="v-settings-modal-content">
                        <label className="v-settings-modal-label">
                            {fm("addUserModal.emailLabel")}
                        </label>
                        <input
                            type="email"
                            className="v-settings-modal-input"
                            value={userEmail}
                            onChange={(e) => {
                                setUserEmail(e.target.value);
                                setEmailError("");
                            }}
                        />
                        {emailError && (
                            <span className="v-settings-modal-error">
                                {emailError}
                            </span>
                        )}
                    </div>
                    <div className="v-settings-modal-actions">
                        <Button
                            onClick={toggleAddUserModal}
                            className="v-settings-modal-button-cancel"
                            fullWidth={false}
                            disabled={isAddingUser}
                        >
                            {fm("addUserModal.cancel")}
                        </Button>
                        <Button
                            onClick={handleAddUser}
                            disabled={isAddingUser}
                            className="v-settings-modal-button-add"
                            fullWidth={false}
                            loading={isAddingUser}
                        >
                            {fm("addUserModal.add")}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
