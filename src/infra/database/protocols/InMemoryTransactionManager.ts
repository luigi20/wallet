import { ITransactionManager } from './ITransaction-manager';

export class InMemoryTransactionManager implements ITransactionManager {
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Apenas executa a função diretamente, simulando o sucesso da transação em memória
    return await fn();
  }
}
