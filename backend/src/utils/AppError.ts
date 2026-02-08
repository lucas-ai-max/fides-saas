export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly userMessage: string;
    public readonly action?: {
        type: string;
        [key: string]: any;
    };
    public readonly retry?: {
        allowed: boolean;
        afterSeconds?: number;
    };

    constructor(
        code: string,
        message: string,
        statusCode = 400,
        userMessage?: string,
        action?: any,
        retry?: any
    ) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.userMessage = userMessage || "Ocorreu um erro inesperado. Tente novamente.";
        this.action = action;
        this.retry = retry;

        // Maintain prototype chain
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
