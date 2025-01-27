export class BaseException extends Error {
  public statusCode = 500;
  public name = "BaseException";
  public message = "";

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
