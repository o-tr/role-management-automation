export class AccountNotFoundError extends Error {
  constructor(
    public readonly service: string,
    public readonly accountId: string,
    message?: string,
  ) {
    super(message || `Account not found: ${service} account ${accountId}`);
    this.name = "AccountNotFoundError";
  }
}
