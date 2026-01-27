import { isNil } from "lodash-es";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import type { GroupDto } from "../dtos/GroupDto";
import type { MapDto } from "../dtos/MapDto";
import type { CreateMapDto } from "../dtos/CreateMapDto";
import type { UpdateGroupDto } from "../dtos/UpdateGroupDto";
import type { UpdateMapDto } from "../dtos/UpdateMapDto";
import { useGetUserGroups } from "../usecases/useGetUserGroups";
import { useGetGroupMaps } from "../usecases/useGetGroupMaps";
import { useCreateMap } from "../usecases/useCreateMap";
import { useDeleteMap } from "../usecases/useDeleteMap";
import { useUpdateGroup } from "../usecases/useUpdateGroup";
import { useUpdateMap } from "../usecases/useUpdateMap";

interface GroupsMapsContextType {
    groups: GroupDto[] | null;
    maps: MapDto[] | null;
    selectedGroup: GroupDto | null;
    selectedMap: MapDto | null;
    loadingGroups: boolean;
    loadingMaps: boolean;
    updatingGroup: boolean;
    updatingMap: boolean;
    creatingMap: boolean;
    deletingMap: boolean;
    error: string | null;
    selectGroup: (group: GroupDto) => void;
    selectMap: (map: MapDto) => void;
    updateSelectedGroup: (data: UpdateGroupDto) => Promise<GroupDto | null>;
    updateSelectedMap: (data: UpdateMapDto) => Promise<MapDto | null>;
    createNewMap: (data: CreateMapDto) => Promise<MapDto | null>;
    deleteSelectedMap: () => Promise<boolean>;
    isInitialized: boolean;
}

const GroupsMapsContext = createContext<GroupsMapsContextType | undefined>(
    undefined,
);

interface GroupsMapsProviderProps {
    children: React.ReactNode;
}

export const GroupsMapsProvider: React.FC<GroupsMapsProviderProps> = ({
    children,
}) => {
    const {
        data: groups,
        loading: loadingGroups,
        error: groupsError,
        fetch: fetchGroups,
        hasFetched: groupsHasFetched,
    } = useGetUserGroups();

    const {
        data: maps,
        loading: loadingMaps,
        error: mapsError,
        fetch: fetchMaps,
    } = useGetGroupMaps();

    const { updateGroup, loading: updatingGroup } = useUpdateGroup();
    const { updateMap, loading: updatingMap } = useUpdateMap();
    const { createMap, loading: creatingMap } = useCreateMap();
    const { deleteMap, loading: deletingMap } = useDeleteMap();

    const [selectedGroup, setSelectedGroup] = useState<GroupDto | null>(null);
    const [selectedMap, setSelectedMap] = useState<MapDto | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!groupsHasFetched && !loadingGroups && !groupsError) fetchGroups();
    }, [groupsHasFetched, loadingGroups, groupsError, fetchGroups]);

    useEffect(() => {
        if (groups && groups.length > 0) {
            if (isNil(selectedGroup)) {
                setSelectedGroup(groups[0]);
            } else {
                const updatedGroup = groups.find(
                    (group) => group.id === selectedGroup.id,
                );
                if (updatedGroup && updatedGroup !== selectedGroup) {
                    setSelectedGroup(updatedGroup);
                }
            }
        }
    }, [groups]);

    useEffect(() => {
        if (maps && maps.length > 0) {
            if (isNil(selectedMap)) {
                setSelectedMap(maps[0]);
            } else {
                const updatedMap = maps.find(
                    (map) => map.id === selectedMap.id,
                );
                if (updatedMap && updatedMap !== selectedMap) {
                    setSelectedMap(updatedMap);
                }
            }
        }
    }, [maps]);

    useEffect(() => {
        if (selectedGroup && groupsHasFetched) {
            fetchMaps(selectedGroup.id);
        }
    }, [selectedGroup?.id, groupsHasFetched]);

    useEffect(() => {
        if (groupsHasFetched && groups && maps) {
            setIsInitialized(true);
        }
    }, [groupsHasFetched, groups, maps]);

    const selectGroup = useCallback(
        async (group: GroupDto) => {
            setSelectedGroup(group);
            setSelectedMap(null);
            await fetchMaps(group.id);
        },
        [fetchMaps],
    );

    const selectMap = useCallback((map: MapDto) => {
        setSelectedMap(map);
    }, []);

    const updateSelectedGroup = useCallback(
        async (data: UpdateGroupDto): Promise<GroupDto | null> => {
            if (!selectedGroup) return null;
            const result = await updateGroup(selectedGroup.id, data);
            if (result) {
                await fetchGroups();
            }
            return result;
        },
        [selectedGroup, updateGroup, fetchGroups],
    );

    const updateSelectedMap = useCallback(
        async (data: UpdateMapDto): Promise<MapDto | null> => {
            if (!selectedGroup || !selectedMap) return null;
            const result = await updateMap(
                selectedGroup.id,
                selectedMap.id,
                data,
            );
            if (result) {
                await fetchMaps(selectedGroup.id);
            }
            return result;
        },
        [selectedGroup, selectedMap, updateMap, fetchMaps],
    );

    const createNewMap = useCallback(
        async (data: CreateMapDto): Promise<MapDto | null> => {
            if (!selectedGroup) return null;
            const result = await createMap(selectedGroup.id, data);
            if (result) {
                await fetchMaps(selectedGroup.id);
                setSelectedMap(result);
            }
            return result;
        },
        [selectedGroup, createMap, fetchMaps],
    );

    const deleteSelectedMap = useCallback(async (): Promise<boolean> => {
        if (!selectedGroup || !selectedMap) return false;
        const currentMapId = selectedMap.id;
        const success = await deleteMap(selectedGroup.id, currentMapId);
        if (success) {
            await fetchMaps(selectedGroup.id);
            setSelectedMap(null);
        }
        return success;
    }, [selectedGroup, selectedMap, deleteMap, fetchMaps]);

    const error = groupsError || mapsError;

    return (
        <GroupsMapsContext.Provider
            value={{
                groups,
                maps,
                selectedGroup,
                selectedMap,
                loadingGroups,
                loadingMaps,
                updatingGroup,
                updatingMap,
                creatingMap,
                deletingMap,
                error,
                selectGroup,
                selectMap,
                updateSelectedGroup,
                updateSelectedMap,
                createNewMap,
                deleteSelectedMap,
                isInitialized,
            }}
        >
            {children}
        </GroupsMapsContext.Provider>
    );
};

export const useGroupsMaps = (): GroupsMapsContextType => {
    const context = useContext(GroupsMapsContext);
    if (context === undefined) {
        throw new Error(
            "useGroupsMaps must be used within a GroupsMapsProvider",
        );
    }
    return context;
};
