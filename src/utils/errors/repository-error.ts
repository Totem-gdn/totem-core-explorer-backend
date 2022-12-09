export enum RepositoryErrorCode {}

export class RepositoryError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }

  code: RepositoryErrorCode | number;
}
