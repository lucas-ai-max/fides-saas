import { supabase } from '@/integrations/supabase/client';

class ExameAIService {
  private threadId: string | null = null;

  async createThread(): Promise<string> {
    const { data, error } = await supabase.functions.invoke('exame-ai', {
      body: { action: 'create_thread' },
    });

    if (error) throw error;
    this.threadId = data.threadId;
    return data.threadId;
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.threadId) {
      await this.createThread();
    }

    const { data, error } = await supabase.functions.invoke('exame-ai', {
      body: {
        action: 'send_message',
        threadId: this.threadId,
        message: userMessage,
      },
    });

    if (error) throw error;
    return data.response;
  }

  resetThread(): void {
    this.threadId = null;
  }
}

export const exameAIService = new ExameAIService();
