import UserRepository from "../dependencies/UserRepository";
import LoginResponseDto, {
    makeLoginResponseDto,
} from "../dtos/LoginResponseDto";
import LoginUserDto from "../dtos/LoginUserDto";
import InvalidCredentialsError from "../errors/InvalidCredentialsError";
import JwtService from "../services/JwtService";
import { verifyPassword } from "../utils/PasswordManager";

export default class LoginUser {
    constructor(
        private userRepository: UserRepository,
        private jwtService: JwtService,
    ) {}

    async exec(loginData: LoginUserDto): Promise<LoginResponseDto> {
        const user = await this.userRepository.findByEmail(loginData.email);
        if (!user) {
            throw new InvalidCredentialsError();
        }

        const isPasswordValid = await verifyPassword(
            loginData.password,
            user.password,
        );
        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        const token = this.jwtService.generateToken({
            userId: user.id,
            email: user.email,
        });

        return makeLoginResponseDto(token, user);
    }
}
