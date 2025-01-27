import { BaseException } from "./BaseException";

export class NotFoundException extends BaseException {
  public statusCode = 404;
  public name = "NotFoundException";
}
