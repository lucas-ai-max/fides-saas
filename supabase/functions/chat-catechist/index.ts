import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  threadId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, threadId }: ChatRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ASSISTANT_ID = Deno.env.get('OPENAI_ASSISTANT_ID');

    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      throw new Error('OpenAI credentials not configured');
    }

    console.log('Processing message:', message);
    console.log('Thread ID:', threadId || 'Creating new thread');

    // Create or use existing thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      });

      if (!threadResponse.ok) {
        const error = await threadResponse.text();
        console.error('Error creating thread:', error);
        throw new Error('Failed to create thread');
      }

      const thread = await threadResponse.json();
      currentThreadId = thread.id;
      console.log('Created new thread:', currentThreadId);
    }

    // Add message to thread
    const addMessageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        role: 'user',
        content: message,
      }),
    });

    if (!addMessageResponse.ok) {
      const error = await addMessageResponse.text();
      console.error('Error adding message:', error);
      throw new Error('Failed to add message');
    }

    console.log('Message added to thread');

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('Error creating run:', error);
      throw new Error('Failed to create run');
    }

    const run = await runResponse.json();
    console.log('Run created:', run.id);

    // Poll for completion
    let runStatus = run.status;
    let attempts = 0;
    const maxAttempts = 60;

    while (runStatus !== 'completed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      });

      if (!statusResponse.ok) {
        const error = await statusResponse.text();
        console.error('Error checking run status:', error);
        throw new Error('Failed to check run status');
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      attempts++;

      console.log(`Run status: ${runStatus} (attempt ${attempts})`);

      if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
        console.error('Run failed:', statusData);
        throw new Error(`Run ${runStatus}: ${statusData.last_error?.message || 'Unknown error'}`);
      }
    }

    if (runStatus !== 'completed') {
      throw new Error('Timeout waiting for assistant response');
    }

    // Get messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    });

    if (!messagesResponse.ok) {
      const error = await messagesResponse.text();
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }

    const messagesData = await messagesResponse.json();
    const lastMessage = messagesData.data[0];

    if (lastMessage.role !== 'assistant') {
      throw new Error('Last message is not from assistant');
    }

    const content = lastMessage.content[0];
    let messageText = '';
    let sources: Array<{ type: string; reference: string }> = [];

    if (content.type === 'text') {
      messageText = content.text.value;
      
      // Extract sources from annotations
      if (content.text.annotations && content.text.annotations.length > 0) {
        sources = content.text.annotations.map((annotation: any) => ({
          type: annotation.type === 'file_citation' ? 'citacao' : 'referencia',
          reference: annotation.text || '',
        }));
      }
    }

    console.log('Response generated successfully');

    return new Response(
      JSON.stringify({
        content: messageText,
        threadId: currentThreadId,
        sources: sources.length > 0 ? sources : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in chat-catechist function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
