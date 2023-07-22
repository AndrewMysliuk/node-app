import { injectable, inject } from "inversify"
import { IConfigService } from "./config.service.interface"
import { DotenvConfigOutput, DotenvParseOutput, config } from "dotenv"
import { ILogger } from "../logger/logger.interface"
import { TYPES } from "../types"

@injectable()
export class ConfigService implements IConfigService {
  private config: DotenvParseOutput

  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    const { error, parsed }: DotenvConfigOutput = config()
    if (error) {
      this.logger.error("[ConfigService] unpossible to read .env file")
    } else {
      this.logger.log("[ConfigService] config was loaded")
      this.config = parsed as DotenvParseOutput
    }
  }

  get(key: string): string {
    return this.config[key]
  }
}
