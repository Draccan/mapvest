import { ChevronDown, ChevronRight, Edit2, Check, X, Plus } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useIntl } from "react-intl";

import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Popover } from "../Popover";
import "./style.css";

const fm = getFormattedMessageWithScope("components.Breadcrumb");

export const Breadcrumb: React.FC = () => {
    const intl = useIntl();
    const {
        maps,
        selectedGroup,
        selectedMap,
        selectMap,
        updateSelectedGroup,
        updateSelectedMap,
        createNewMap,
        updatingGroup,
        updatingMap,
        creatingMap,
    } = useGroupsMaps();

    const [isMapPopoverOpen, setIsMapPopoverOpen] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [isEditingMap, setIsEditingMap] = useState(false);
    const [isCreatingMap, setIsCreatingMap] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [mapName, setMapName] = useState("");
    const [newMapName, setNewMapName] = useState("");

    const mapButtonRef = useRef<HTMLButtonElement>(null);
    const groupInputRef = useRef<HTMLInputElement>(null);
    const mapInputRef = useRef<HTMLInputElement>(null);
    const newMapInputRef = useRef<HTMLInputElement>(null);

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

    if (!selectedGroup) {
        return null;
    }

    return (
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
                    <div className="c-breadcrumb-group-display">
                        <span className="c-breadcrumb-name">
                            {selectedGroup.name}
                        </span>
                        <button
                            className="c-breadcrumb-edit-icon"
                            onClick={handleGroupEditClick}
                            title={intl.formatMessage({
                                id: "components.Breadcrumb.renameGroup",
                            })}
                        >
                            <Edit2 size={14} />
                        </button>
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
                                            onClick={() => handleMapSelect(map)}
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
                                                setNewMapName(e.target.value)
                                            }
                                            onKeyDown={handleCreateMapKeyDown}
                                            className="c-breadcrumb-dropdown-create-input"
                                            placeholder={intl.formatMessage({
                                                id: "components.Breadcrumb.newMapPlaceholder",
                                            })}
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
                                    </div>
                                )}
                            </div>
                        </Popover>
                    </div>
                ) : (
                    <span className="c-breadcrumb-name c-breadcrumb-name-placeholder">
                        {fm("noMapSelected")}
                    </span>
                )}
            </div>
        </nav>
    );
};
