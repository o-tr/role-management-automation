import { BaseException } from "./BaseException";

export class AccountNotFoundError extends BaseException {
  public statusCode = 404;

  constructor(
    public readonly service: string,
    public readonly accountId: string,
    message?: string,
  ) {
    super(message || `Account not found: ${service} account ${accountId}`);
    this.name = "AccountNotFoundError";
  }
}
