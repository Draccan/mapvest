import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import type { UserGroupRole } from "../../../core/commons/enums";
import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import { useUser } from "../../../core/contexts/UserContext";
import { useAddUsersToGroup } from "../../../core/usecases/useAddUsersToGroup";
import { useGetGroupUsers } from "../../../core/usecases/useGetGroupUsers";
import { useRemoveUserFromGroup } from "../../../core/usecases/useRemoveUserFromGroup";
import { useUpdateUserInGroup } from "../../../core/usecases/useUpdateUserInGroup";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import usePrevious from "../../commons/hooks/usePrevious";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { Modal } from "../../components/Modal";
import { UserTable } from "../../components/Settings/UserTable";
import { ThemeToggle } from "../../components/ThemeToggle";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Settings");

export const Settings: React.FC = () => {
    const intl = useIntl();
    const { selectedGroup } = useGroupsMaps();
    const { user } = useUser();
    const {
        data: groupUsers,
        loading,
        fetch: fetchGroupUsers,
        error,
    } = useGetGroupUsers();
    const { addUsersToGroup, loading: isAddingUser } = useAddUsersToGroup();
    const { removeUserFromGroup, loading: isRemovingUser } =
        useRemoveUserFromGroup();
    const { updateUserInGroup, loading: isUpdatingUserInGroup } =
        useUpdateUserInGroup();

    const previousSelectedGroupId = usePrevious(selectedGroup?.id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    useEffect(() => {
        if (
            selectedGroup?.id &&
            !loading &&
            !error &&
            previousSelectedGroupId !== selectedGroup.id
        ) {
            fetchGroupUsers(selectedGroup.id);
        }
    }, [previousSelectedGroupId, selectedGroup?.id, loading, error]);

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
            toggleAddUserModal();
            fetchGroupUsers(selectedGroup!.id);
        } catch (err) {
            console.error("Error adding user:", err);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        try {
            await removeUserFromGroup(selectedGroup!.id, userId);
            fetchGroupUsers(selectedGroup!.id);
        } catch (err) {
            console.error("Error removing user:", err);
        }
    };

    const handleUpdateUserRole = async (
        userId: string,
        role: Exclude<UserGroupRole, UserGroupRole.Owner>,
    ): Promise<void> => {
        await updateUserInGroup(selectedGroup!.id, userId, { role });
        fetchGroupUsers(selectedGroup!.id);
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
                    <UserTable
                        users={groupUsers}
                        loading={loading}
                        onRemoveUser={handleRemoveUser}
                        isRemoving={isRemovingUser}
                        currentUserId={user!.id}
                        currentUserRole={selectedGroup?.role}
                        onUpdateUserRole={handleUpdateUserRole}
                        isUpdatingRole={isUpdatingUserInGroup}
                    />
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
