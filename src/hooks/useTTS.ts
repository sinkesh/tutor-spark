import { useState, useRef, useCallback } from 'react';
import { generateTTS } from '@/config/services';
import { toast } from 'sonner';

export type TTSState = 'idle' | 'loading' | 'playing' | 'error';

interface TTSPlaybackState {
  state: TTSState;
  messageId: string | null;
  error: string | null;
  currentChunk?: number;
  totalChunks?: number;
}

interface TTSChunk {
  text: string;
  audioUrl?: string;
  isLoaded: boolean;
}

export const useTTS = () => {
  const [playbackState, setPlaybackState] = useState<TTSPlaybackState>({
    state: 'idle',
    messageId: null,
    error: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<TTSChunk[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const isQueueProcessingRef = useRef<boolean>(false);

  // Split text into 25-word chunks
  const splitTextIntoChunks = useCallback((text: string): string[] => {
    const words = text.split(' ');
    const chunks: string[] = [];
    const wordsPerChunk = 25;
    
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ');
      chunks.push(chunk);
    }
    
    return chunks;
  }, []);

  // Preload audio chunks in background
  const preloadAudioChunks = useCallback(async (chunks: string[]): Promise<TTSChunk[]> => {
    const ttsChunks: TTSChunk[] = chunks.map(text => ({ text, isLoaded: false }));
    
    // Start loading first 2 chunks immediately for faster start
    const initialLoadPromises = ttsChunks.slice(0, 2).map(async (chunk, index) => {
      try {
        const audioBlob = await generateTTS(chunk.text);
        chunk.audioUrl = URL.createObjectURL(audioBlob);
        chunk.isLoaded = true;
        console.log(`Chunk ${index} preloaded`);
      } catch (error) {
        console.error(`Failed to preload chunk ${index}:`, error);
      }
      return chunk;
    });
    
    await Promise.all(initialLoadPromises);
    
    // Load remaining chunks in background
    const remainingChunks = ttsChunks.slice(2);
    if (remainingChunks.length > 0) {
      remainingChunks.forEach(async (chunk, index) => {
        try {
          const audioBlob = await generateTTS(chunk.text);
          chunk.audioUrl = URL.createObjectURL(audioBlob);
          chunk.isLoaded = true;
          console.log(`Background chunk ${index + 2} loaded`);
        } catch (error) {
          console.error(`Failed to load background chunk ${index + 2}:`, error);
        }
      });
    }
    
    return ttsChunks;
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Clean up all chunk URLs
    chunksRef.current.forEach(chunk => {
      if (chunk.audioUrl) {
        URL.revokeObjectURL(chunk.audioUrl);
      }
    });
    
    currentMessageIdRef.current = null;
    currentChunkIndexRef.current = 0;
    isQueueProcessingRef.current = false;
    chunksRef.current = [];
    
    setPlaybackState({ state: 'idle', messageId: null, error: null });
  }, []);

  // Play a single chunk
  const playChunk = useCallback(async (chunk: TTSChunk, chunkIndex: number, totalChunks: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!chunk.audioUrl) {
        reject(new Error('Chunk audio URL not available'));
        return;
      }

      const audio = new Audio(chunk.audioUrl);
      audioRef.current = audio;

      // Optimized audio settings
      audio.preload = 'auto';
      audio.playbackRate = 1.1; // 10% faster playback
      audio.volume = 0.85;

      audio.addEventListener('play', () => {
        console.log(`Playing chunk ${chunkIndex + 1}/${totalChunks}`);
        setPlaybackState({ 
          state: 'playing', 
          messageId: currentMessageIdRef.current, 
          error: null,
          currentChunk: chunkIndex + 1,
          totalChunks
        });
      });

      audio.addEventListener('ended', () => {
        console.log(`Chunk ${chunkIndex + 1} ended`);
        resolve();
      });

      audio.addEventListener('error', (e) => {
        console.error(`Chunk ${chunkIndex + 1} error:`, e);
        reject(new Error('Audio playback failed'));
      });

      // Start playback immediately
      audio.play().catch(reject);
    });
  }, []);

  // Process chunk queue
  const processChunkQueue = useCallback(async () => {
    if (isQueueProcessingRef.current) return;
    
    isQueueProcessingRef.current = true;
    const chunks = chunksRef.current;
    
    try {
      for (let i = currentChunkIndexRef.current; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Wait for chunk to be loaded if not ready
        if (!chunk.isLoaded) {
          console.log(`Waiting for chunk ${i + 1} to load...`);
          let attempts = 0;
          while (!chunk.isLoaded && attempts < 50) { // 5 second wait max
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (!chunk.isLoaded) {
            throw new Error(`Chunk ${i + 1} failed to load`);
          }
        }
        
        // Play the chunk
        await playChunk(chunk, i, chunks.length);
        currentChunkIndexRef.current = i + 1;
      }
      
      // All chunks played successfully
      console.log('All chunks completed');
      stopAudio();
      
    } catch (error) {
      console.error('Chunk queue processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Playback failed';
      setPlaybackState({ 
        state: 'error', 
        messageId: currentMessageIdRef.current, 
        error: errorMessage 
      });
      toast.error(errorMessage);
      stopAudio();
    }
    
    isQueueProcessingRef.current = false;
  }, [playChunk, stopAudio]);

  const playTTS = useCallback(async (text: string, messageId: string) => {
    // Stop any currently playing audio immediately
    stopAudio();

    // Validate text
    if (!text || text.trim().length === 0) {
      toast.error('No text available for speech');
      return;
    }

    const optimizedText = text.trim();
    const textChunks = splitTextIntoChunks(optimizedText);
    
    if (textChunks.length === 0) {
      toast.error('No valid text chunks found');
      return;
    }

    console.log(`Processing ${textChunks.length} chunks for message: ${messageId}`);
    
    setPlaybackState({ state: 'loading', messageId, error: null });
    currentMessageIdRef.current = messageId;
    currentChunkIndexRef.current = 0;

    try {
      // Preload chunks with queuing
      chunksRef.current = await preloadAudioChunks(textChunks);
      
      // Start playing the first chunk immediately
      await processChunkQueue();
      
    } catch (error) {
      console.error('TTS playback failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate speech';
      setPlaybackState({ state: 'error', messageId, error: errorMessage });
      toast.error(errorMessage);
      stopAudio();
    }
  }, [stopAudio, splitTextIntoChunks, preloadAudioChunks, processChunkQueue]);

  const getMessagePlaybackState = useCallback((messageId: string): TTSState => {
    if (currentMessageIdRef.current === messageId) {
      return playbackState.state;
    }
    return 'idle';
  }, [playbackState.state]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stopAudio();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopAudio]);

  return {
    playTTS,
    stopAudio,
    getMessagePlaybackState,
    currentPlaybackState: playbackState,
    cleanup,
  };
};
