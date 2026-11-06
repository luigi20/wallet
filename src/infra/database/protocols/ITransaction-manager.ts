export abstract class ITransactionManager {
  abstract execute<T>(operation: () => Promise<T>): Promise<T>;
}
