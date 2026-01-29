import { useEffect, useRef, useState } from 'react';

// Generate a tension background music using Web Audio API as fallback
function generateTensionAudio() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 8; // 8 seconds loop
  const sampleRate = audioContext.sampleRate;
  const numChannels = 2;
  const buffer = audioContext.createBuffer(numChannels, duration * sampleRate, sampleRate);

  // Generate tension music with low frequency drones and subtle pulses
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate;
      // Low drone at 55Hz (A1)
      const drone1 = Math.sin(2 * Math.PI * 55 * time) * 0.15;
      // Second drone at 82.5Hz (E2)
      const drone2 = Math.sin(2 * Math.PI * 82.5 * time) * 0.1;
      // Subtle pulse effect
      const pulse = Math.sin(2 * Math.PI * 0.5 * time) * 0.05;
      // Add some noise for texture
      const noise = (Math.random() - 0.5) * 0.02;
      
      channelData[i] = drone1 + drone2 + pulse + noise;
    }
  }

  return buffer;
}

export function useBackgroundMusic() {
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('musicEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const wasPlayingRef = useRef(false); // Track if music was playing before pause

  useEffect(() => {
    // Try to load external audio file first, fallback to generated audio
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';
    audio.src = '/assets/audio/tension-music.mp3';
    
    // Check if file exists
    audio.addEventListener('error', () => {
      console.log('Using generated tension music (no audio file found)');
      // Use Web Audio API generated music
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    });

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('musicEnabled', JSON.stringify(isMusicEnabled));
  }, [isMusicEnabled]);

  const play = () => {
    if (!isMusicEnabled) return;

    // Try HTML5 Audio first
    if (audioRef.current && audioRef.current.src && !audioRef.current.error) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            wasPlayingRef.current = true;
          })
          .catch((error) => {
            console.warn('HTML5 audio playback failed, using generated audio:', error);
            playGeneratedAudio();
          });
      }
    } else {
      playGeneratedAudio();
    }
  };

  const playGeneratedAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Stop previous source if exists
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }

    const buffer = generateTensionAudio();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Create gain node for volume control
    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 0.3;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    source.connect(gainNodeRef.current);
    source.start(0);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    wasPlayingRef.current = true;
  };

  const pause = () => {
    // Only save playing state if music is actually playing
    if (isPlaying) {
      wasPlayingRef.current = true;
    }
    
    if (audioRef.current && !audioRef.current.error && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    
    setIsPlaying(false);
  };

  const resume = () => {
    // Try HTML5 Audio first
    if (audioRef.current && audioRef.current.src && !audioRef.current.error) {
      if (audioRef.current.paused) {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              wasPlayingRef.current = true;
            })
            .catch((error) => {
              console.warn('HTML5 audio resume failed, trying generated audio:', error);
              playGeneratedAudio();
            });
        }
      } else {
        setIsPlaying(true);
        wasPlayingRef.current = true;
      }
    } else if (audioContextRef.current) {
      // Resume Web Audio API context
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          setIsPlaying(true);
          wasPlayingRef.current = true;
        }).catch((error) => {
          console.warn('Web Audio resume failed:', error);
          playGeneratedAudio();
        });
      } else if (!sourceNodeRef.current) {
        // No source playing, start new one
        playGeneratedAudio();
      } else {
        setIsPlaying(true);
        wasPlayingRef.current = true;
      }
    } else {
      // No audio initialized, start from scratch
      playGeneratedAudio();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      } catch (e) {
        // Already stopped
      }
    }
    
    setIsPlaying(false);
    wasPlayingRef.current = false;
  };

  const toggleMusic = () => {
    const newValue = !isMusicEnabled;
    setIsMusicEnabled(newValue);
    
    if (!newValue) {
      // Muting - pause the music if playing
      if (isPlaying) {
        pause();
      }
    } else {
      // Unmuting - resume music
      // If music was playing before or if it should be playing
      if (wasPlayingRef.current || isPlaying) {
        resume();
      }
    }
  };

  const setVolume = (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume;
    }
  };

  return {
    isMusicEnabled,
    isPlaying,
    play,
    pause,
    resume,
    stop,
    toggleMusic,
    setVolume,
  };
}

