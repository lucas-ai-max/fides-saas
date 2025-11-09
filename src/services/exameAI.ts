import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ASSISTANT_ID = 'asst_iTAdW7kD5VJhGjaUOBf2o1ZD';

class ExameAIService {
  private threadId: string | null = null;

  async createThread(): Promise<string> {
    const thread = await openai.beta.threads.create();
    this.threadId = thread.id;
    return thread.id;
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.threadId) {
      await this.createThread();
    }

    await openai.beta.threads.messages.create(this.threadId!, {
      role: 'user',
      content: userMessage,
    });

    const run = await openai.beta.threads.runs.create(this.threadId!, {
      assistant_id: ASSISTANT_ID,
    });

    const completedRun = await this.waitForRunCompletion(this.threadId!, run.id);

    if (completedRun.status !== 'completed') {
      throw new Error('Erro ao processar mensagem');
    }

    const messages = await openai.beta.threads.messages.list(this.threadId!);
    const lastMessage = messages.data[0];

    if (lastMessage.content[0].type === 'text') {
      return lastMessage.content[0].text.value;
    }

    return 'Desculpe, não consegui processar sua pergunta.';
  }

  private async waitForRunCompletion(threadId: string, runId: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      const run = await openai.beta.threads.runs.retrieve(threadId as any, runId as any);

      if (run.status === 'completed') return run;
      if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
        throw new Error(`Run falhou: ${run.status}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Timeout');
  }

  resetThread(): void {
    this.threadId = null;
  }
}

export const exameAIService = new ExameAIService();
