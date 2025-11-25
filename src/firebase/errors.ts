export class FirestorePermissionError extends Error {
  constructor({
    message,
    path,
    operation,
    requestResourceData,
  }: {
    message?: string;
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    requestResourceData?: any;
  }) {
    super(
      message ||
        `Missing or insufficient permissions to ${operation} document at ${path}.`
    );
    this.name = 'FirestorePermissionError';
  }
}
