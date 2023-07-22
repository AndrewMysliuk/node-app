import "reflect-metadata"
import { Container } from "inversify"
import { IConfigService } from "../config/config.service.interface"
import { IUserService } from "./users.service.interface"
import { IUsersRepository } from "./users.repository.interface"
import { TYPES } from "../types"
import { UserService } from "./users.service"
import { User } from "./user.entity"
import { UserModel } from "@prisma/client"

const ConfigServiceMock: IConfigService = {
  get: jest.fn(),
}

const UserRepositoryMock: IUsersRepository = {
  create: jest.fn(),
  find: jest.fn(),
}

const container = new Container()
let configService: IConfigService
let userService: IUserService
let userRepository: IUsersRepository

beforeAll(() => {
  container.bind<IUserService>(TYPES.UserService).to(UserService)
  container.bind<IConfigService>(TYPES.ConfigService).toConstantValue(ConfigServiceMock)
  container.bind<IUsersRepository>(TYPES.UserRepository).toConstantValue(UserRepositoryMock)

  configService = container.get<IConfigService>(TYPES.ConfigService)
  userRepository = container.get<IUsersRepository>(TYPES.UserRepository)
  userService = container.get<IUserService>(TYPES.UserService)
})

let createdUser: UserModel | null

describe("User Service", () => {
  it("createUser", async () => {
    configService.get = jest.fn().mockReturnValueOnce("1")
    userRepository.create = jest.fn().mockImplementationOnce(
      (user: User): UserModel => ({
        name: user.name,
        email: user.email,
        password: user.password,
        id: 1,
      }),
    )

    createdUser = await userService.createUser({
      email: "test@gmail.com",
      name: "Test",
      password: "password1234",
    })

    expect(createdUser?.id).toEqual(1)
    expect(createdUser?.password).not.toEqual("password1234")
  })

  it("validateUser - Success", async () => {
    userRepository.find = jest.fn().mockReturnValueOnce(createdUser)

    const result = await userService.validateUser({
      email: "test@gmail.com",
      password: "password1234",
    })

    expect(result).toBeTruthy()
  })

  it("validateUser - Wrong Password", async () => {
    userRepository.find = jest.fn().mockReturnValueOnce(createdUser)

    const result = await userService.validateUser({
      email: "test@gmail.com",
      password: "1234password",
    })

    expect(result).toBeFalsy()
  })

  it("validateUser - User not found", async () => {
    userRepository.find = jest.fn().mockReturnValueOnce(null)

    const result = await userService.validateUser({
      email: "test@gmail.com",
      password: "password1234",
    })

    expect(result).toBeFalsy()
  })
})
