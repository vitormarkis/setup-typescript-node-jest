import { NextFunction, Request, Response } from "express"
import { TokenService } from "~/@core/domain/interfaces/token-service"
import { UsersRepository } from "~/@core/domain/repositories/users-repository"

export default class RequireAuth {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async handle(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    try {
      const authorizationToken = request.headers.authorization
      if (!authorizationToken) throw new Error("No authorization token provided.")

      const [bearer, tokenHeader] = authorizationToken.split(" ")
      if (bearer.toLowerCase() !== "bearer") {
        throw new Error("Invalid token provided")
      }

      const { subject: username } = this.tokenService.validate({ tokenHeader })

      const user = await this.usersRepository.getUserByUsername(username)
      if (!user) throw new Error("User not found!")
      request.user = user

      return next()
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({
          messsage: error.message,
        })
      }
    }
  }
}
