import UserEntity from "../entities/UserEntity";

export default interface LoginResponseDto {
    token: string;
    user: {
        id: string;
        name: string;
        surname: string;
        email: string;
    };
}

export function makeLoginResponseDto(
    token: string,
    user: UserEntity,
): LoginResponseDto {
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
        },
    };
}
