export interface VideoItem {
  id: string;
  url: string;
  title: string;
  addedAt: number;
}

export interface TimerState {
  isRunning: boolean;
  timeLeft: number; // in seconds
  initialTime: number; // for progress bar
}

export enum PlaybackState {
  STOPPED,
  PLAYING,
  PAUSED
}