import { supabase } from '@/integrations/supabase/client';

export async function aiResearch(query: string, type: string, sources?: string[]) {
  const { data, error } = await supabase.functions.invoke('ai-research', {
    body: { query, type, sources },
  });

  if (error) throw error;
  return data;
}

export async function aiGenerate(prompt: string, type: string, context?: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke('ai-generate', {
    body: { prompt, type, context },
  });

  if (error) throw error;
  return data;
}

export async function scrapeCompetitor(url: string, extractType?: string) {
  const { data, error } = await supabase.functions.invoke('scrape-competitor', {
    body: { url, extractType },
  });

  if (error) throw error;
  return data;
}

export async function textToSpeech(text: string, voiceId?: string) {
  const { data, error } = await supabase.functions.invoke('text-to-speech', {
    body: { text, voiceId },
  });

  if (error) throw error;
  return data;
}

export function playAudioFromBase64(base64Audio: string) {
  const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
  const audio = new Audio(audioUrl);
  return audio.play();
}
