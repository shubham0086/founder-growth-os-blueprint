import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { toast } from 'sonner';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (text: string, voiceId?: string) => {
    if (!text || text.trim().length === 0) {
      toast.error('No text to speak');
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: text.slice(0, 5000), voiceId: voiceId || 'JBFqnCBsd6RMkjVDRZzb' },
      });

      if (error) {
        throw error;
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Create audio from base64
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        toast.error('Failed to play audio');
      };

      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      toast.error('Failed to generate speech. Check if ElevenLabs is configured.');
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  return { speak, stop, isPlaying, isLoading };
}
