export type SpotifyTrackSchema = {
  name: string;
  preview_url: string | null;
  artists: Array<{
    name: string;
    external_urls: {
      spotify: string;
    };
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
    }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
};

export type Song = {
  songUrl: string;
  preview: string | null;
  artists: {
    name: string;
    externalUrl: string;
  }[];
  image: string | undefined;
  title: string;
  duration_Ms: number;
};
