import { injectable, inject } from "inversify"
import { PrismaClient, UserModel } from "@prisma/client"
import { TYPES } from "../types"
import { ILogger } from "../logger/logger.interface"

@injectable()
export class PrismaService {
  client: PrismaClient

  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    this.client = new PrismaClient()
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect()
      this.logger.log("[PrismaService] DB Connected...")
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(`[PrismaService] error: ${e.message}`)
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect()
      this.logger.log("[PrismaService] DB Disconnected...")
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(`[PrismaService] error: ${e.message}`)
      }
    }
  }
}
