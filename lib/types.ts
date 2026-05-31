export type AdMode = "static" | "auto" | "ab";

export type AdMarker = {
  id: string;
  startTime: number;
  mode: AdMode;
  adIds: string[];
};

export type Ad = {
  id: string;
  name: string;
  filename: string;
  duration: number;
};

export type EpisodeInfo = {
  filename: string;
  url: string;
};

export type CreateMarkerBody = {
  id?: string;
  startTime: number;
  mode?: AdMode;
  adIds?: string[];
};

export type UpdateMarkerBody = Partial<{
  startTime: number;
  mode: AdMode;
  adIds: string[];
}>;
