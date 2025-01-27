import { BaseException } from "./BaseException";

export class ForbiddenException extends BaseException {
  public statusCode = 403;
  public name = "ForbiddenException";
}
