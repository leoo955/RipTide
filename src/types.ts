/*
 * Types partagés pour l'application RipTide.
 */
export interface VideoResolution {
  label: string;
  height: number;
  container: string;
}

export interface VideoMetadata {
  url: string;
  title: string;
  duration_sec: number;
  thumbnail_url: string;
  author: string;
  resolutions: VideoResolution[];
}
