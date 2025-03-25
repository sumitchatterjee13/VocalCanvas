/**
 * Plays an audio file from a URL
 * @param url The URL of the audio file
 * @returns A promise that resolves when the audio finishes playing
 */
export function playAudioFromUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Creating audio element to play URL:', url.substring(0, 50) + '...');
    const audio = new Audio();
    
    // Set up event listeners first
    audio.addEventListener('ended', () => {
      console.log('Audio playback completed successfully');
      resolve();
    });
    
    audio.addEventListener('error', (error) => {
      console.error('Error during audio playback:', error);
      console.error('Audio error code:', audio.error ? audio.error.code : 'unknown');
      reject(error);
    });
    
    audio.addEventListener('canplaythrough', () => {
      console.log('Audio can play through, starting playback');
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Error playing audio:', err);
            reject(err);
          });
        }
      } catch (e) {
        console.error('Exception playing audio:', e);
        reject(e);
      }
    });
    
    // Set the audio properties
    audio.preload = 'auto';
    audio.src = url;
    
    // Load the audio
    console.log('Loading audio from URL');
    audio.load();
    
    // Set a backup timer in case canplaythrough doesn't fire
    setTimeout(() => {
      if (audio.paused) {
        console.log('Backup timer: attempting to play audio');
        try {
          audio.play().catch(err => {
            console.error('Error during backup play:', err);
            // Don't reject here, as it might play successfully later
          });
        } catch (e) {
          console.error('Exception during backup play:', e);
        }
      }
    }, 1000);
  });
}

/**
 * Creates a URL from an audio blob
 * @param audioData The audio data as an ArrayBuffer
 * @returns The URL of the audio
 */
export function createAudioUrl(audioData: ArrayBuffer): string {
  console.log('Creating audio URL from ArrayBuffer of size:', audioData.byteLength);
  try {
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    console.log('Successfully created audio URL:', url);
    
    // Test load the audio to ensure it's valid (helps with debugging)
    const audio = new Audio();
    audio.src = url;
    audio.load();
    
    return url;
  } catch (error) {
    console.error('Error creating audio URL:', error);
    throw error;
  }
}

/**
 * Converts a string to a more URL-friendly format
 * @param text The text to convert
 * @returns The URL-friendly string
 */
export function stringToUrlSafeId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Downloads combined audio from an array of audio URLs
 * @param audioUrls Array of audio URLs
 * @param fileName Name for the downloaded file
 */
export function downloadCombinedAudio(audioUrls: string[], fileName: string): void {
  if (audioUrls.length === 0) return;
  
  // Create a download link
  const link = document.createElement('a');
  
  // If there's only one audio URL, just download it
  if (audioUrls.length === 1) {
    link.href = audioUrls[0];
    link.download = `${fileName || 'story-audio'}.mp3`;
    link.click();
    return;
  }
  
  // Create a temporary message to show the user
  const message = document.createElement('div');
  message.textContent = 'Preparing audio for download...';
  message.style.position = 'fixed';
  message.style.top = '20px';
  message.style.left = '50%';
  message.style.transform = 'translateX(-50%)';
  message.style.padding = '10px 20px';
  message.style.backgroundColor = 'rgba(0,0,0,0.7)';
  message.style.color = 'white';
  message.style.borderRadius = '5px';
  message.style.zIndex = '9999';
  document.body.appendChild(message);
  
  // Since we can't easily combine audio client-side in the browser,
  // we'll just create a zip file with all audio segments
  import('jszip').then((JSZip) => {
    const zip = new JSZip.default();
    const folder = zip.folder('story-audio');
    
    // Add each audio file to the zip
    const fetchPromises = audioUrls.map(async (url, index) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        folder?.file(`segment-${index + 1}.mp3`, blob);
      } catch (error) {
        console.error(`Error fetching audio ${index}:`, error);
      }
    });
    
    // Generate the zip file when all audio files are added
    Promise.all(fetchPromises).then(() => {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        const zipUrl = URL.createObjectURL(content);
        link.href = zipUrl;
        link.download = `${fileName || 'story-audio'}.zip`;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(zipUrl);
        document.body.removeChild(message);
      });
    });
  }).catch(error => {
    console.error('Error loading JSZip:', error);
    document.body.removeChild(message);
    alert('Failed to prepare audio download. Please try again.');
  });
}

/**
 * Combines multiple audio files into a single audio file and downloads it
 * @param audioUrls Array of audio URLs
 * @param fileName Name for the downloaded file
 */
export async function downloadSingleAudioFile(audioUrls: string[], fileName: string): Promise<void> {
  if (audioUrls.length === 0) return;
  
  // Create a temporary message to show the user
  const message = document.createElement('div');
  message.textContent = 'Preparing combined audio...';
  message.style.position = 'fixed';
  message.style.top = '20px';
  message.style.left = '50%';
  message.style.transform = 'translateX(-50%)';
  message.style.padding = '10px 20px';
  message.style.backgroundColor = 'rgba(0,0,0,0.7)';
  message.style.color = 'white';
  message.style.borderRadius = '5px';
  message.style.zIndex = '9999';
  document.body.appendChild(message);
  
  try {
    // Create audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Fetch all the audio data
    const audioBuffers = await Promise.all(
      audioUrls.map(async (url) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
      })
    );
    
    // Calculate the total duration
    const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
    
    // Create a new buffer for the combined audio
    const combinedBuffer = audioContext.createBuffer(
      1, // Use mono channel for simplicity
      totalLength,
      audioBuffers[0].sampleRate
    );
    
    // Copy each buffer to the combined buffer
    const combinedChannel = combinedBuffer.getChannelData(0);
    let offset = 0;
    
    audioBuffers.forEach((buffer) => {
      const channelData = buffer.getChannelData(0);
      combinedChannel.set(channelData, offset);
      offset += buffer.length;
    });
    
    // Convert the combined buffer to a WAV file
    const wavBlob = audioBufferToWav(combinedBuffer);
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(wavBlob);
    link.download = `${fileName || 'story-audio'}.wav`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(link.href);
    document.body.removeChild(message);
  } catch (error) {
    console.error('Error combining audio:', error);
    document.body.removeChild(message);
    alert('Failed to combine audio files. Please try again.');
  }
}

/**
 * Converts an AudioBuffer to a WAV Blob
 * Based on: https://github.com/mattdiamond/Recorderjs
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numberOfChannels = 1; // Using mono for simplicity
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const interleaved = new Float32Array(buffer.length);
  const channelData = buffer.getChannelData(0);
  
  // Copy channel data
  for (let i = 0; i < buffer.length; i++) {
    interleaved[i] = channelData[i];
  }
  
  // Create the buffer
  const bufferLength = interleaved.length * 2;
  const arrayBuffer = new ArrayBuffer(44 + bufferLength);
  const view = new DataView(arrayBuffer);
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File length
  view.setUint32(4, 36 + bufferLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // Format chunk identifier
  writeString(view, 12, 'fmt ');
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (raw)
  view.setUint16(20, format, true);
  // Channel count
  view.setUint16(22, numberOfChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // Block align (channel count * bytes per sample)
  view.setUint16(32, numberOfChannels * 2, true);
  // Bits per sample
  view.setUint16(34, bitDepth, true);
  // Data chunk identifier
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, bufferLength, true);
  
  // Write the PCM samples
  floatTo16BitPCM(view, 44, interleaved);
  
  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Helper function to write a string to a DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Helper function to convert Float32Array to 16-bit PCM
 */
function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array): void {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
} 