import {
    ChevronDown,
    ChevronRight,
    Edit2,
    Check,
    X,
    Plus,
    Trash2,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useIntl } from "react-intl";

import { UserGroupRole } from "../../../core/commons/enums";
import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import { LoadingSpinner } from "../LoadingSpinner";
import { Modal } from "../Modal";
import { Popover } from "../Popover";
import "./style.css";

const fm = getFormattedMessageWithScope("components.Breadcrumb");

export const Breadcrumb: React.FC = () => {
    const intl = useIntl();
    const {
        groups,
        maps,
        selectedGroup,
        selectedMap,
        selectGroup,
        selectMap,
        updateSelectedGroup,
        updateSelectedMap,
        createNewMap,
        deleteSelectedMap,
        updatingGroup,
        updatingMap,
        creatingMap,
        deletingMap,
    } = useGroupsMaps();

    const [isGroupPopoverOpen, setIsGroupPopoverOpen] = useState(false);
    const [isMapPopoverOpen, setIsMapPopoverOpen] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [isEditingMap, setIsEditingMap] = useState(false);
    const [isCreatingMap, setIsCreatingMap] = useState(false);
    const [isDeleteMapModalOpen, setIsDeleteMapModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [mapName, setMapName] = useState("");
    const [newMapName, setNewMapName] = useState("");

    const groupButtonRef = useRef<HTMLButtonElement>(null);
    const mapButtonRef = useRef<HTMLButtonElement>(null);
    const groupInputRef = useRef<HTMLInputElement>(null);
    const mapInputRef = useRef<HTMLInputElement>(null);
    const newMapInputRef = useRef<HTMLInputElement>(null);

    const isGroupOwner = selectedGroup?.role === UserGroupRole.Owner;
    const canDeleteMap =
        selectedGroup?.role === UserGroupRole.Owner ||
        selectedGroup?.role === UserGroupRole.Admin;

    useEffect(() => {
        if (isEditingGroup && groupInputRef.current) {
            groupInputRef.current.focus();
            groupInputRef.current.select();
        }
    }, [isEditingGroup]);

    useEffect(() => {
        if (isEditingMap && mapInputRef.current) {
            mapInputRef.current.focus();
            mapInputRef.current.select();
        }
    }, [isEditingMap]);

    useEffect(() => {
        if (isCreatingMap && newMapInputRef.current) {
            newMapInputRef.current.focus();
        }
    }, [isCreatingMap]);

    const handleGroupEditClick = () => {
        if (selectedGroup) {
            setGroupName(selectedGroup.name);
            setIsEditingGroup(true);
        }
    };

    const handleMapEditClick = () => {
        if (selectedMap) {
            setMapName(selectedMap.name);
            setIsEditingMap(true);
            setIsMapPopoverOpen(false);
        }
    };

    const handleGroupSave = async () => {
        if (
            selectedGroup &&
            groupName.trim() &&
            groupName !== selectedGroup.name
        ) {
            await updateSelectedGroup({ name: groupName.trim() });
        }
        setIsEditingGroup(false);
    };

    const handleMapSave = async () => {
        if (
            selectedGroup &&
            selectedMap &&
            mapName.trim() &&
            mapName !== selectedMap.name
        ) {
            await updateSelectedMap({ name: mapName.trim() });
        }
        setIsEditingMap(false);
    };

    const handleGroupCancel = () => {
        setIsEditingGroup(false);
        setGroupName(selectedGroup?.name || "");
    };

    const handleMapCancel = () => {
        setIsEditingMap(false);
        setMapName(selectedMap?.name || "");
    };

    const handleGroupKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleGroupSave();
        } else if (e.key === "Escape") {
            handleGroupCancel();
        }
    };

    const handleMapKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleMapSave();
        } else if (e.key === "Escape") {
            handleMapCancel();
        }
    };

    const handleMapSelect = (map: typeof selectedMap) => {
        if (map) {
            selectMap(map);
            setIsMapPopoverOpen(false);
        }
    };

    const handleGroupSelect = (group: typeof selectedGroup) => {
        if (group) {
            selectGroup(group);
            setIsGroupPopoverOpen(false);
        }
    };

    const handleCreateMapClick = () => {
        setNewMapName("");
        setIsCreatingMap(true);
    };

    const handleCreateMapSave = async () => {
        if (newMapName.trim()) {
            await createNewMap({ name: newMapName.trim() });
            setIsCreatingMap(false);
            setIsMapPopoverOpen(false);
            setNewMapName("");
        }
    };

    const handleCreateMapCancel = () => {
        setIsCreatingMap(false);
        setNewMapName("");
    };

    const handleCreateMapKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCreateMapSave();
        } else if (e.key === "Escape") {
            handleCreateMapCancel();
        }
    };

    const handleDeleteMapClick = () => {
        setIsMapPopoverOpen(false);
        setIsDeleteMapModalOpen(true);
    };

    const handleDeleteMapConfirm = async () => {
        const success = await deleteSelectedMap();
        if (success) {
            setIsDeleteMapModalOpen(false);
        }
    };

    const handleDeleteMapCancel = () => {
        setIsDeleteMapModalOpen(false);
    };

    if (!selectedGroup) {
        return null;
    }

    return (
        <>
            <nav className="c-breadcrumb" aria-label="Breadcrumb">
                <div className="c-breadcrumb-item">
                    {isEditingGroup ? (
                        <div className="c-breadcrumb-edit-container">
                            <input
                                ref={groupInputRef}
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                onKeyDown={handleGroupKeyDown}
                                className="c-breadcrumb-input"
                                disabled={updatingGroup}
                            />
                            <button
                                onClick={handleGroupSave}
                                className="c-breadcrumb-action-btn c-breadcrumb-action-btn-confirm"
                                disabled={updatingGroup || !groupName.trim()}
                                title={intl.formatMessage({
                                    id: "components.Breadcrumb.save",
                                })}
                            >
                                <Check size={14} />
                            </button>
                            <button
                                onClick={handleGroupCancel}
                                className="c-breadcrumb-action-btn c-breadcrumb-action-btn-cancel"
                                disabled={updatingGroup}
                                title={intl.formatMessage({
                                    id: "components.Breadcrumb.cancel",
                                })}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="c-breadcrumb-selector">
                            <button
                                ref={groupButtonRef}
                                className="c-breadcrumb-trigger"
                                onClick={() =>
                                    setIsGroupPopoverOpen(!isGroupPopoverOpen)
                                }
                            >
                                <span className="c-breadcrumb-name">
                                    {selectedGroup.name}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className="c-breadcrumb-chevron"
                                />
                            </button>
                            <Popover
                                isOpen={isGroupPopoverOpen}
                                onClose={() => {
                                    setIsGroupPopoverOpen(false);
                                }}
                                anchorElement={groupButtonRef.current}
                            >
                                <div className="c-breadcrumb-dropdown">
                                    <div className="c-breadcrumb-dropdown-header">
                                        {fm("selectGroup")}
                                    </div>
                                    <div className="c-breadcrumb-dropdown-list">
                                        {groups?.map((group) => (
                                            <button
                                                key={group.id}
                                                className={`c-breadcrumb-dropdown-item ${
                                                    group.id ===
                                                    selectedGroup.id
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleGroupSelect(group)
                                                }
                                            >
                                                {group.name}
                                            </button>
                                        ))}
                                    </div>
                                    {isGroupOwner && (
                                        <div className="c-breadcrumb-dropdown-actions">
                                            <button
                                                className="c-breadcrumb-dropdown-action"
                                                onClick={() => {
                                                    handleGroupEditClick();
                                                    setIsGroupPopoverOpen(
                                                        false,
                                                    );
                                                }}
                                            >
                                                <Edit2 size={14} />
                                                {fm("renameGroup")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Popover>
                        </div>
                    )}
                </div>
                <ChevronRight size={16} className="c-breadcrumb-separator" />
                <div className="c-breadcrumb-item">
                    {isEditingMap ? (
                        <div className="c-breadcrumb-edit-container">
                            <input
                                ref={mapInputRef}
                                type="text"
                                value={mapName}
                                onChange={(e) => setMapName(e.target.value)}
                                onKeyDown={handleMapKeyDown}
                                className="c-breadcrumb-input"
                                disabled={updatingMap}
                            />
                            <button
                                onClick={handleMapSave}
                                className="c-breadcrumb-action-btn c-breadcrumb-action-btn-confirm"
                                disabled={updatingMap || !mapName.trim()}
                                title={intl.formatMessage({
                                    id: "components.Breadcrumb.save",
                                })}
                            >
                                <Check size={14} />
                            </button>
                            <button
                                onClick={handleMapCancel}
                                className="c-breadcrumb-action-btn c-breadcrumb-action-btn-cancel"
                                disabled={updatingMap}
                                title={intl.formatMessage({
                                    id: "components.Breadcrumb.cancel",
                                })}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : selectedMap ? (
                        <div className="c-breadcrumb-selector">
                            <button
                                ref={mapButtonRef}
                                className="c-breadcrumb-trigger"
                                onClick={() =>
                                    setIsMapPopoverOpen(!isMapPopoverOpen)
                                }
                            >
                                <span className="c-breadcrumb-name">
                                    {selectedMap.name}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className="c-breadcrumb-chevron"
                                />
                            </button>
                            <Popover
                                isOpen={isMapPopoverOpen}
                                onClose={() => {
                                    setIsMapPopoverOpen(false);
                                    setIsCreatingMap(false);
                                    setNewMapName("");
                                }}
                                anchorElement={mapButtonRef.current}
                            >
                                <div className="c-breadcrumb-dropdown">
                                    <div className="c-breadcrumb-dropdown-header">
                                        {fm("selectMap")}
                                    </div>
                                    <div className="c-breadcrumb-dropdown-list">
                                        {maps?.map((map) => (
                                            <button
                                                key={map.id}
                                                className={`c-breadcrumb-dropdown-item ${
                                                    map.id === selectedMap.id
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleMapSelect(map)
                                                }
                                            >
                                                {map.name}
                                            </button>
                                        ))}
                                    </div>
                                    {isCreatingMap ? (
                                        <div className="c-breadcrumb-dropdown-create">
                                            <input
                                                ref={newMapInputRef}
                                                type="text"
                                                value={newMapName}
                                                onChange={(e) =>
                                                    setNewMapName(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={
                                                    handleCreateMapKeyDown
                                                }
                                                className="c-breadcrumb-dropdown-create-input"
                                                placeholder={intl.formatMessage(
                                                    {
                                                        id: "components.Breadcrumb.newMapPlaceholder",
                                                    },
                                                )}
                                                disabled={creatingMap}
                                            />
                                            <button
                                                onClick={handleCreateMapSave}
                                                className="c-breadcrumb-action-btn c-breadcrumb-action-btn-confirm"
                                                disabled={
                                                    creatingMap ||
                                                    !newMapName.trim()
                                                }
                                                title={intl.formatMessage({
                                                    id: "components.Breadcrumb.save",
                                                })}
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={handleCreateMapCancel}
                                                className="c-breadcrumb-action-btn c-breadcrumb-action-btn-cancel"
                                                disabled={creatingMap}
                                                title={intl.formatMessage({
                                                    id: "components.Breadcrumb.cancel",
                                                })}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="c-breadcrumb-dropdown-actions">
                                            <button
                                                className="c-breadcrumb-dropdown-action"
                                                onClick={handleCreateMapClick}
                                            >
                                                <Plus size={14} />
                                                {fm("addMap")}
                                            </button>
                                            <button
                                                className="c-breadcrumb-dropdown-action"
                                                onClick={handleMapEditClick}
                                            >
                                                <Edit2 size={14} />
                                                {fm("renameMap")}
                                            </button>
                                            {canDeleteMap && (
                                                <button
                                                    className="c-breadcrumb-dropdown-action c-breadcrumb-dropdown-action-danger"
                                                    onClick={
                                                        handleDeleteMapClick
                                                    }
                                                >
                                                    <Trash2 size={14} />
                                                    {fm("deleteMap")}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Popover>
                        </div>
                    ) : maps && maps.length === 0 ? (
                        <div className="c-breadcrumb-selector">
                            <button
                                ref={mapButtonRef}
                                className="c-breadcrumb-trigger c-breadcrumb-trigger-warning"
                                onClick={() =>
                                    setIsMapPopoverOpen(!isMapPopoverOpen)
                                }
                            >
                                <span className="c-breadcrumb-name c-breadcrumb-name-placeholder">
                                    {fm("noMaps")}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className="c-breadcrumb-chevron"
                                />
                            </button>
                            <Popover
                                isOpen={isMapPopoverOpen}
                                onClose={() => {
                                    setIsMapPopoverOpen(false);
                                    setIsCreatingMap(false);
                                    setNewMapName("");
                                }}
                                anchorElement={mapButtonRef.current}
                            >
                                <div className="c-breadcrumb-dropdown">
                                    <div className="c-breadcrumb-dropdown-header">
                                        {fm("selectMap")}
                                    </div>
                                    <div className="c-breadcrumb-dropdown-empty">
                                        {fm("noMapsAvailable")}
                                    </div>
                                    {isCreatingMap ? (
                                        <div className="c-breadcrumb-dropdown-create">
                                            <input
                                                ref={newMapInputRef}
                                                type="text"
                                                value={newMapName}
                                                onChange={(e) =>
                                                    setNewMapName(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={
                                                    handleCreateMapKeyDown
                                                }
                                                className="c-breadcrumb-dropdown-create-input"
                                                placeholder={intl.formatMessage(
                                                    {
                                                        id: "components.Breadcrumb.newMapPlaceholder",
                                                    },
                                                )}
                                                disabled={creatingMap}
                                            />
                                            <button
                                                onClick={handleCreateMapSave}
                                                className="c-breadcrumb-action-btn c-breadcrumb-action-btn-confirm"
                                                disabled={
                                                    creatingMap ||
                                                    !newMapName.trim()
                                                }
                                                title={intl.formatMessage({
                                                    id: "components.Breadcrumb.save",
                                                })}
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={handleCreateMapCancel}
                                                className="c-breadcrumb-action-btn c-breadcrumb-action-btn-cancel"
                                                disabled={creatingMap}
                                                title={intl.formatMessage({
                                                    id: "components.Breadcrumb.cancel",
                                                })}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="c-breadcrumb-dropdown-actions">
                                            <button
                                                className="c-breadcrumb-dropdown-action"
                                                onClick={handleCreateMapClick}
                                            >
                                                <Plus size={14} />
                                                {fm("addMap")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Popover>
                        </div>
                    ) : (
                        <div>
                            <LoadingSpinner />
                        </div>
                    )}
                </div>
            </nav>
            <Modal
                isOpen={isDeleteMapModalOpen}
                onClose={handleDeleteMapCancel}
                title={fm("deleteMapModal.title")}
                isCloseDisabled={deletingMap}
            >
                <div className="c-breadcrumb-delete-modal">
                    <p className="c-breadcrumb-delete-modal-message">
                        {intl.formatMessage(
                            {
                                id: "components.Breadcrumb.deleteMapModal.message",
                            },
                            { mapName: selectedMap?.name },
                        )}
                    </p>
                    <div className="c-breadcrumb-delete-modal-actions">
                        <Button
                            kind="secondary"
                            onClick={handleDeleteMapCancel}
                            disabled={deletingMap}
                            fullWidth={false}
                        >
                            {fm("deleteMapModal.cancel")}
                        </Button>
                        <Button
                            kind="danger"
                            onClick={handleDeleteMapConfirm}
                            loading={deletingMap}
                            fullWidth={false}
                        >
                            {fm("deleteMapModal.confirm")}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
