'use client';

import { useConversation } from '@11labs/react';
import type { Role } from '@11labs/client';
import { Mic } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ELEVENLABS_API_KEY, VOICES_IDS } from '@/lib/utils';

export default function AgentPage() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  
  const conversation = useConversation({
    apiKey: ELEVENLABS_API_KEY,
    onConnect: () => {
      console.log('Connected');
      setStatus('connected');
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setStatus('idle');
    },
    onMessage: (props: { message: string; source: Role }) => {
      console.log('Message:', props);
    },
    onError: (message: string, context?: any) => {
      console.error('Error:', message, context);
      setStatus('error');
    },
  });

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  };

  const startConversation = useCallback(async () => {
    try {
      setStatus('connecting');
      
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert('Microphone permission is required');
        setStatus('error');
        return;
      }

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: VOICES_IDS.oxley.id,
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setStatus('error');
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setStatus('idle');
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      setStatus('error');
    }
  }, [conversation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-2xl font-bold">ElevenLabs Agent</h1>
      
      <div className="flex flex-col items-center space-y-4">
        <Button
          size="lg"
          variant={status === 'connected' ? 'destructive' : 'default'}
          onClick={status === 'connected' ? stopConversation : startConversation}
          disabled={status === 'connecting'}
          className="w-32 h-32 rounded-full p-0 flex items-center justify-center"
        >
          <Mic 
            size={32} 
            className={status === 'connecting' ? 'animate-pulse' : ''} 
          />
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {status === 'idle' && 'Click to start conversation'}
          {status === 'connecting' && 'Connecting...'}
          {status === 'connected' && 'Connected - Click to stop'}
          {status === 'error' && 'Error - Try again'}
        </div>
      </div>
    </div>
  );
}
