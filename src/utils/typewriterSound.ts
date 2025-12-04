// Génère un son Game Boy style pour l'effet typewriter
export function playTypewriterSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Fréquence style Game Boy (800-1200 Hz)
    oscillator.frequency.value = 800 + Math.random() * 400;
    oscillator.type = 'square'; // Son carré style Game Boy
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  } catch (error) {
    // Ignore les erreurs audio (permissions, etc.)
    console.debug('Audio not available:', error);
  }
}

