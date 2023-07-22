import { Container, ContainerModule, interfaces } from "inversify"
import { ILogger } from "./logger/logger.interface"
import { LoggerService } from "./logger/logger.service"
import { TYPES } from "./types"
import { ExeptionFilter } from "./errors/exeption.filter"
import { IExeptionFilter } from "./errors/exeption.filter.interface"
import { UserController } from "./users/users.controller"
import { App } from "./app"
import { IUserService } from "./users/users.service.interface"
import { UserService } from "./users/users.service"
import { IUserController } from "./users/users.controller.interface"
import { IConfigService } from "./config/config.service.interface"
import { ConfigService } from "./config/config.service"
import { PrismaService } from "./database/prisma.service"
import { IUsersRepository } from "./users/users.repository.interface"
import { UsersRepository } from "./users/users.repository"

export interface IBootstrapReturn {
  appContainer: Container
  app: App
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope()
  bind<IExeptionFilter>(TYPES.IExeptionFilter).to(ExeptionFilter).inSingletonScope()
  bind<IUserController>(TYPES.UserController).to(UserController).inSingletonScope()
  bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope()
  bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope()
  bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope()
  bind<IUsersRepository>(TYPES.UserRepository).to(UsersRepository).inSingletonScope()
  bind<App>(TYPES.Application).to(App)
})

async function bootstrap(): Promise<IBootstrapReturn> {
  const appContainer = new Container()
  appContainer.load(appBindings)
  const app = appContainer.get<App>(TYPES.Application)
  await app.init()

  return { app, appContainer }
}

export const boot = bootstrap()
