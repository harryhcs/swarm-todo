export class ValidationError extends Error {
  readonly name = "ValidationError";
  constructor(message: string) {
    super(message);
  }
}

export class InternalError extends Error {
  readonly name = "InternalError";
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
  }
}
