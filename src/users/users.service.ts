import { injectable, inject } from "inversify"
import { UserLoginDto } from "./dto/user-login.dto"
import { UserRegisterDto } from "./dto/user-register.dto"
import { User } from "./user.entity"
import { IUserService } from "./users.service.interface"
import { TYPES } from "../types"
import { IConfigService } from "../config/config.service.interface"
import { IUsersRepository } from "./users.repository.interface"
import { UserModel } from "@prisma/client"
import { GetResult } from "@prisma/client/runtime/library"

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.UserRepository) private userRepository: IUsersRepository,
  ) {}

  async createUser({ email, name, password }: UserRegisterDto): Promise<UserModel | null> {
    const newUser = new User(email, name)
    const salt = this.configService.get("SALT")
    await newUser.setPassword(password, Number(salt))

    const existedUser = await this.userRepository.find(email)
    if (existedUser) {
      return null
    }

    return this.userRepository.create(newUser)
  }

  async validateUser({ email, password }: UserLoginDto): Promise<boolean> {
    const existedUser = await this.userRepository.find(email)
    if (!existedUser) {
      return false
    }

    const newUser = new User(existedUser.email, existedUser.name, existedUser.password)
    return newUser.checkPassword(password)
  }

  async getUser(email: string): Promise<UserModel | null> {
    return this.userRepository.find(email)
  }
}
