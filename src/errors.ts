export class StartBlockNotFoundError extends Error {
  static {
    this.prototype.name = "StartBlockNotFoundError";
  }
}

export class EndBlockNotFoundError extends Error {
  static {
    this.prototype.name = "EndBlockNotFoundError";
  }
}
