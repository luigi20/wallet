class AppError extends Error {
  public message: string;
  public statusCode: number;
  public readonly id: string | undefined; // Tornando 'id' opcional, já que você pode não usá-lo sempre
  public traceSteps?: string[]; // Adicione esta linha para definir a propriedade traceSteps como opcional

  constructor(
    message: string,
    statusCode?: number,
    id?: string,
    traceSteps?: string[],
  ) {
    super(message); // Chama o construtor da classe pai (Error)
    this.name = this.constructor.name; // Define o nome da classe para AppError
    this.statusCode = statusCode ? statusCode : 400; // Define o statusCode, 400 é o valor padrão
    this.id = id;
    this.traceSteps = traceSteps; // Inicializa a propriedade traceSteps
  }
}

export { AppError };
