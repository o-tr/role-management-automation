import { BaseException } from "./BaseException";

export class UnauthorizedException extends BaseException {
  public statusCode = 401;
  public name = "UnauthorizedException";
}
