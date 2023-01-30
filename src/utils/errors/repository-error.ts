export enum RepositoryErrorCode {}

export class RepositoryError extends Error {
  code: RepositoryErrorCode | number;

  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
