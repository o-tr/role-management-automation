import { BaseException } from "./BaseException";

export class BadRequestException extends BaseException {
  public statusCode = 400;
  public name = "BadRequestException";
}
