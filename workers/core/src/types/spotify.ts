export type SpotifyTrackSchema = {
  name: string;
  preview_url: string | null;
  artists: {
    name: string;
    external_urls: {
      spotify: string;
    };
  }[];
  album: {
    images: {
      url: string;
    }[];
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
};

export type SpotifyArtistSchema = {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: null;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: {
    height: number;
    url: string;
    width: number;
  }[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
};

export type SpotifyShowSchema = {
  show: {
    name: string;
    publisher: string;
    description: string;
    images: {
      url: string;
    }[];
    id: string;
    external_urls: {
      spotify: string;
    };
  };
};

export type Artist = {
  name: string;
  image: string;
  url: string;
  genres: string[];
  popularity: number;
  followers: number;
};

export type Show = {
  name: string;
  publisher: string;
  description: string;
  image: string;
  id: string;
  url: string;
};

export type Track = {
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
