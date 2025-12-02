import { API_URL } from "../../config";
import TokenStorageService from "../../utils/TokenStorageService";
import type AddressDto from "../dtos/AddressDto";
import type { CategoryDto } from "../dtos/CategoryDto";
import type { CreateMapPointDto } from "../dtos/CreateMapPointDto";
import type CreateUserDto from "../dtos/CreateUserDto";
import type { GroupDto } from "../dtos/GroupDto";
import type LoginResponseDto from "../dtos/LoginResponseDto";
import type LoginUserDto from "../dtos/LoginUserDto";
import type { MapDto } from "../dtos/MapDto";
import type { MapPointDto } from "../dtos/MapPointDto";
import type { RouteDto } from "../dtos/RouteDto";
import type TokenResponseDto from "../dtos/TokenResponseDto";
import type UpdateUserDto from "../dtos/UpdateUserDto";
import type UserDto from "../dtos/UserDto";
import { UnauthorizedError } from "./errors/UnauthorizedError";

export default class ApiClient {
    private token: string | null = null;

    constructor() {
        this.token = TokenStorageService.getAccessToken();
    }

    async refreshToken(): Promise<TokenResponseDto> {
        const refreshToken = TokenStorageService.getRefreshToken();
        if (!refreshToken) {
            console.error("No refresh token available");
            throw new UnauthorizedError();
        }

        const response = await fetch(`${API_URL}/token/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshToken}`,
            },
        });

        if (!response.ok) {
            throw new UnauthorizedError();
        }

        const tokenResponse: TokenResponseDto = await response.json();
        TokenStorageService.setTokens(
            tokenResponse.accessToken,
            tokenResponse.refreshToken,
        );
        this.token = tokenResponse.accessToken;
        return tokenResponse;
    }

    private async fetchWithInterceptors(
        url: string,
        options: RequestInit,
        withCredentials = true,
        isRetry = false,
    ): Promise<Response> {
        let token = this.token;

        if (withCredentials && !this.token) {
            const tokenResponse = await this.refreshToken();
            token = tokenResponse.accessToken;
        }

        const baseHeaders = {
            "Content-Type": "application/json",
            Authorization: withCredentials ? `Bearer ${token}` : "",
        };

        const response = await fetch(url, {
            method: options.method,
            headers: {
                ...baseHeaders,
                ...options.headers,
            },
            body: options.body,
        }).then(async (res) => {
            if (res.status === 401 && withCredentials) {
                if (options.headers && isRetry) {
                    console.error(
                        "Unable to perform the request after token refresh",
                    );
                    throw new UnauthorizedError();
                }

                await this.refreshToken();

                return await this.fetchWithInterceptors(
                    url,
                    {
                        method: options.method,
                        body: options.body,
                    },
                    withCredentials,
                    true,
                );
            } else {
                return res;
            }
        });

        return await response;
    }

    async searchAddresses(searchQuery: string): Promise<AddressDto[]> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/search/addresses?text=${encodeURIComponent(searchQuery)}`,
            {
                method: "GET",
            },
        );

        return response.json();
    }

    async login(credentials: LoginUserDto): Promise<LoginResponseDto> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/users/login`,
            {
                method: "POST",
                body: JSON.stringify(credentials),
            },
            false,
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Login failed");
        }

        const loginResponse: LoginResponseDto = await response.json();

        this.token = loginResponse.token;
        TokenStorageService.setTokens(
            loginResponse.token,
            loginResponse.refreshToken,
        );

        return loginResponse;
    }

    async logout(): Promise<void> {
        const refreshToken = TokenStorageService.getRefreshToken();
        if (!refreshToken) {
            TokenStorageService.clearTokens();
            this.token = null;
            throw new UnauthorizedError();
        }

        try {
            await this.fetchWithInterceptors(
                `${API_URL}/users/logout`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                    },
                },
                false,
            );
            throw new UnauthorizedError();
        } catch (err) {
            console.error("Error during logout:", err);
            throw err;
        } finally {
            TokenStorageService.clearTokens();
            this.token = null;
        }
    }

    async createUser(
        userData: CreateUserDto,
    ): Promise<UserDto | { message: string }> {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.error || errorData.message || "Failed to create user",
            );
        }

        return response.json();
    }

    async updateUserPassword(
        userId: string,
        data: UpdateUserDto,
    ): Promise<void> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/users/${userId}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update password");
        }
    }

    async getCurrentUser(): Promise<UserDto> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/users/me`,
            {
                method: "GET",
            },
        );

        if (!response.ok) {
            throw new Error("Failed to get current user");
        }

        return response.json();
    }

    async getUserGroups(): Promise<GroupDto[]> {
        const response = await this.fetchWithInterceptors(`${API_URL}/groups`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getGroupMaps(groupId: string): Promise<MapDto[]> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/${groupId}/maps`,
            {
                method: "GET",
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getMapPointsByMap(
        groupId: string,
        mapId: string,
    ): Promise<MapPointDto[]> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/${groupId}/maps/${mapId}/points`,
            {
                method: "GET",
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async createMapPointInMap(
        groupId: string,
        mapId: string,
        data: CreateMapPointDto,
    ): Promise<MapPointDto> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/${groupId}/maps/${mapId}/points`,
            {
                method: "POST",
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async deleteMapPoints(
        groupId: string,
        mapId: string,
        pointIds: string[],
    ): Promise<void> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/${groupId}/maps/${mapId}/points`,
            {
                method: "DELETE",
                body: JSON.stringify({ pointIds }),
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    async calculateOptimizedRoute(mapPoints: MapPointDto[]): Promise<RouteDto> {
        const coordinates = mapPoints
            .map((point) => `${point.long},${point.lat}`)
            .join(";");

        const url = `https://router.project-osrm.org/trip/v1/driving/${coordinates}?source=first&destination=last&roundtrip=false&geometries=geojson`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`OSRM API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== "Ok") {
            throw new Error(`OSRM API error: ${data.code}`);
        }

        const trip = data.trips[0];

        // Warning: OSRM returns coordinates in [long, lat] format (GeoJson) and
        // we prefer [lat, long] (leaflet)
        const geometry = trip.geometry.coordinates.map(
            (coord: [number, number]) =>
                [coord[1], coord[0]] as [number, number],
        );

        // Docs: waypoint_index has the order of waypoints in the optimized
        // route. Instead, trips_index is the index of the waypoint in the input
        // list.
        const waypoints = data.waypoints.map((wp: any) => ({
            location: [wp.location[1], wp.location[0]] as [number, number],
            waypointIndex: wp.waypoint_index,
            originalIndex: wp.trips_index,
        }));

        return {
            waypoints,
            distance: trip.distance,
            duration: trip.duration,
            geometry,
        };
    }

    async getMapCategories(
        groupId: string,
        mapId: string,
    ): Promise<CategoryDto[]> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/${groupId}/maps/${mapId}/categories`,
            {
                method: "GET",
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async createMapCategory(
        groupId: string,
        mapId: string,
        data: { description: string; color: string },
    ): Promise<CategoryDto> {
        const response = await this.fetchWithInterceptors(
            `${API_URL}/${groupId}/maps/${mapId}/categories`,
            {
                method: "POST",
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}
