import { Request, Response } from "express"
import { TokenService } from "~/@core/domain/interfaces/token-service"
import { UsersRepository } from "~/@core/domain/repositories/users-repository"
import ListUserUseCase from "~/@core/domain/use-cases/list-user.use-case"

export default class ListUserController {
  constructor(
    readonly listUserUseCase: ListUserUseCase,
    private readonly tokenService: TokenService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async handle(request: Request, response: Response) {
    try {
      const user = await this.usersRepository.getUserByUsername(request.user.username)
      if (!user) throw new Error("User not found.")

      const isAllowed = this.listUserUseCase.checkPermissions(user.role)

      if (!isAllowed) throw new Error("You don't have permission.")

      const output = await this.listUserUseCase.execute()

      return response.json(output)
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({
          messsage: error.message,
        })
      }
    }
  }
}
