import { Audio } from 'expo-av';
import { useSettingsStore } from '@/src/store/settingsStore';

class AudioManager {
  private blipSound: Audio.Sound | null = null;
  private successSound: Audio.Sound | null = null;
  private thinkingSound: Audio.Sound | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: blip } = await Audio.Sound.createAsync(
        require('@/assets/sounds/blip.mp3')
      );
      const { sound: success } = await Audio.Sound.createAsync(
        require('@/assets/sounds/success.mp3')
      );
      const { sound: thinking } = await Audio.Sound.createAsync(
        require('@/assets/sounds/thinking.mp3')
      );

      // Make thinking sound loop seamlessly
      await thinking.setIsLoopingAsync(true);
      await thinking.setVolumeAsync(0.3); // Keep hum quiet

      this.blipSound = blip;
      this.successSound = success;
      this.thinkingSound = thinking;
      this.isInitialized = true;
    } catch (e) {
      console.warn('Failed to initialize AudioManager', e);
    }
  }

  playBlip() {
    if (!useSettingsStore.getState().soundEnabled) return;
    this.blipSound?.replayAsync().catch(() => {});
  }

  playSuccess() {
    if (!useSettingsStore.getState().soundEnabled) return;
    this.successSound?.replayAsync().catch(() => {});
  }

  startThinking() {
    if (!useSettingsStore.getState().soundEnabled) return;
    this.thinkingSound?.playAsync().catch(() => {});
  }

  stopThinking() {
    this.thinkingSound?.stopAsync().catch(() => {});
  }
}

export const audioManager = new AudioManager();
