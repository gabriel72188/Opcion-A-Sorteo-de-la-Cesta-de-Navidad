export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DuplicateParticipantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateParticipantError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AlreadyOccupiedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlreadyOccupiedError';
  }
}

export class NotOccupiedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotOccupiedError';
  }
}
