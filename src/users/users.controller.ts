import { Request, Response, NextFunction } from "express"
import { BaseController } from "../common/base.controller"
import { HTTPError } from "../errors/http-error.class"
import { inject, injectable } from "inversify"
import { TYPES } from "../types"
import { ILogger } from "../logger/logger.interface"
import "reflect-metadata"
import { IUserController } from "./users.controller.interface"
import { UserLoginDto } from "./dto/user-login.dto"
import { UserRegisterDto } from "./dto/user-register.dto"
import { ValidateMiddleware } from "../common/validate.middleware"
import { sign } from "jsonwebtoken"
import { IConfigService } from "../config/config.service.interface"
import { IUserService } from "./users.service.interface"
import { ParamsDictionary } from "express-serve-static-core"
import { ParsedQs } from "qs"
import { AuthGuard } from "../common/auth.guard"

@injectable()
export class UserController extends BaseController implements IUserController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.ConfigService) private configService: IConfigService,
  ) {
    super(loggerService)
    this.bindRoutes([
      {
        path: "/register",
        method: "post",
        func: this.register,
        middlewares: [new ValidateMiddleware(UserRegisterDto)],
      },

      {
        path: "/login",
        method: "post",
        func: this.login,
        middlewares: [new ValidateMiddleware(UserLoginDto)],
      },

      {
        path: "/info",
        method: "get",
        func: this.info,
        middlewares: [new AuthGuard()],
      },
    ])
  }

  async login({ body }: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): Promise<void> {
    const result = await this.userService.validateUser(body)
    console.log(result)
    if (!result) {
      return next(new HTTPError(401, "Unauthorized", "ctx"))
    }

    const jwt = await this.signJWT(body.email, this.configService.get("SECRET"))
    this.ok(res, { jwt })
  }

  async register({ body }: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<void> {
    const result = await this.userService.createUser(body)
    if (!result) {
      return next(new HTTPError(422, "User already exist"))
    }

    this.ok(res, {
      id: result.id,
      email: result.email,
      name: result.name,
    })
  }

  async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
    const userInfo = await this.userService.getUser(String(user))
    this.ok(res, { email: userInfo?.email, id: userInfo?.id, name: userInfo?.name })
  }

  private signJWT(email: string, secret: string): Promise<string> {
    return new Promise<string>((res, rej) => {
      sign(
        {
          email,
          iat: Math.floor(Date.now() / 1000),
        },
        secret,
        {
          algorithm: "HS256",
        },
        (err, token) => {
          if (err) rej(err)

          res(token as string)
        },
      )
    })
  }
}
