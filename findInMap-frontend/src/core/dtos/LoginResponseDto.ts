interface UserDto {
    id: string;
    name: string;
    surname: string;
    email: string;
}

export default interface LoginResponseDto {
    token: string;
    refreshToken: string;
    user: UserDto;
}
