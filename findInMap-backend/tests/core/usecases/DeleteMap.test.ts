import { UserGroupRole } from "../../../src/core/commons/enums";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import DeleteMap from "../../../src/core/usecases/DeleteMap";
import { mockGroupRepository, mockMapRepository } from "../../helpers";

describe("DeleteMap", () => {
    let deleteMap: DeleteMap;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");
    const userId = "user-id-123";
    const groupId = "group-id-456";
    const mapId = "map-id-789";

    beforeEach(() => {
        jest.clearAllMocks();
        deleteMap = new DeleteMap(mockGroupRepository, mockMapRepository);
    });

    describe("exec", () => {
        it("should successfully delete map when user is owner", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                    isPublic: false,
                    publicId: null,
                },
            ]);

            mockMapRepository.deleteMap.mockResolvedValue(undefined);

            await deleteMap.exec(mapId, groupId, userId);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.deleteMap).toHaveBeenCalledWith(mapId);
        });

        it("should successfully delete map when user is admin", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "other-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Admin,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                    isPublic: false,
                    publicId: null,
                },
            ]);

            mockMapRepository.deleteMap.mockResolvedValue(undefined);

            await deleteMap.exec(mapId, groupId, userId);

            expect(mockMapRepository.deleteMap).toHaveBeenCalledWith(mapId);
        });

        it("should throw NotAllowedActionError when user is contributor", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: "other-user",
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Contributor,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: mapId,
                    groupId: groupId,
                    name: "Test Map",
                    isPublic: false,
                    publicId: null,
                },
            ]);

            await expect(
                deleteMap.exec(mapId, groupId, userId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(mockMapRepository.deleteMap).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when user has no access to group", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: "different-group-id",
                        name: "Different Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            await expect(
                deleteMap.exec(mapId, groupId, userId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).not.toHaveBeenCalled();
            expect(mockMapRepository.deleteMap).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when map does not belong to group", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
                {
                    group: {
                        id: groupId,
                        name: "Test Group",
                        createdBy: userId,
                        createdAt: mockDate,
                        updatedAt: mockDate,
                    },
                    role: UserGroupRole.Owner,
                },
            ]);

            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
                {
                    id: "different-map-id",
                    groupId: groupId,
                    name: "Different Map",
                    isPublic: false,
                    publicId: null,
                },
            ]);

            await expect(
                deleteMap.exec(mapId, groupId, userId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(
                mockGroupRepository.memoizedFindByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(
                mockMapRepository.memoizedFindMapByGroupId,
            ).toHaveBeenCalledWith(groupId);
            expect(mockMapRepository.deleteMap).not.toHaveBeenCalled();
        });

        it("should throw NotAllowedActionError when user has no groups", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

            await expect(
                deleteMap.exec(mapId, groupId, userId),
            ).rejects.toThrow(NotAllowedActionError);

            expect(mockMapRepository.deleteMap).not.toHaveBeenCalled();
        });
    });
});
