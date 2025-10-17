import UserEntity from "../entities/UserEntity";

export default interface LoginResponseDto {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        surname: string;
        email: string;
    };
}

export function makeLoginResponseDto(
    token: string,
    refreshToken: string,
    user: UserEntity,
): LoginResponseDto {
    return {
        token,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
        },
    };
}
