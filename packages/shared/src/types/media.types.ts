export enum MediaType {
  MOVIE = 'movie',
  TV = 'tv',
}

export interface MediaItemDto {
  id: string;
  tmdbId: number;
  imdbId: string | null;
  mediaType: MediaType;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  genres: { id: number; name: string }[];
  runtime: number | null;
}

export interface WatchProgressDto {
  id: string;
  userId: string;
  torrentFileId: string;
  mediaItemId: string | null;
  positionSeconds: number;
  durationSeconds: number | null;
  completed: boolean;
  lastWatchedAt: string;
}
