import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.28.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, threadId, message } = await req.json();
    
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
      defaultHeaders: {
        'OpenAI-Beta': 'assistants=v2',
      },
    });

    const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID') || 'asst_iTAdW7kD5VJhGjaUOBf2o1ZD';

    // Create new thread
    if (action === 'create_thread') {
      console.log('Creating thread with v2 API...');
      const thread = await openai.beta.threads.create({}, {
        headers: { 'OpenAI-Beta': 'assistants=v2' }
      });
      console.log('Thread created:', thread.id);
      return new Response(JSON.stringify({ threadId: thread.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send message and get response
    if (action === 'send_message') {
      if (!threadId) {
        throw new Error('threadId é obrigatório');
      }

      console.log('Sending message to thread:', threadId);

      // Add user message
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message,
      }, {
        headers: { 'OpenAI-Beta': 'assistants=v2' }
      });

      // Run assistant
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      }, {
        headers: { 'OpenAI-Beta': 'assistants=v2' }
      });

      console.log('Run created:', run.id);

      // Wait for completion
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id, {
        headers: { 'OpenAI-Beta': 'assistants=v2' }
      });
      let attempts = 0;
      const maxAttempts = 60;

      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
          console.error('Run failed:', runStatus.status, runStatus);
          throw new Error(`Run falhou: ${runStatus.status}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id, {
          headers: { 'OpenAI-Beta': 'assistants=v2' }
        });
        attempts++;
      }

      if (runStatus.status !== 'completed') {
        throw new Error('Timeout ao aguardar resposta');
      }

      console.log('Run completed, fetching messages...');

      // Get messages
      const messages = await openai.beta.threads.messages.list(threadId, {}, {
        headers: { 'OpenAI-Beta': 'assistants=v2' }
      });
      const lastMessage = messages.data[0];

      if (lastMessage.content[0].type === 'text') {
        return new Response(
          JSON.stringify({ response: lastMessage.content[0].text.value }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ response: 'Desculpe, não consegui processar sua pergunta.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Ação inválida');
  } catch (error) {
    console.error('Erro na função exame-ai:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
