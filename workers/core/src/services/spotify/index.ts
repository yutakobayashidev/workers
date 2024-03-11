import { Song, SpotifyTrackSchema } from "@/types/spotify";

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks?limit=10`;
const TOP_ARTIST_ENDPOINT = `https://api.spotify.com/v1/me/top/artists?limit=21`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const SHOWS_ENDPOINT = "https://api.spotify.com/v1/me/shows?limit=12";

export const getSpotifyAccessToken = async (
  SPOTIFY_CLIENT_ID: string,
  SPOTIFY_CLIENT_SECRET: string,
  REFRESH_TOKEN: string
) => {
  const basic = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });

  const json: any = await response.json();

  return json.access_token;
};

export const getNowPlaying = async (accessToken: string) => {
  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getTopTracks = async (accessToken: string) => {
  const tracksResponse = await fetch(TOP_TRACKS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { items } = (await tracksResponse.json()) as {
    items: SpotifyTrackSchema[];
  };
  const tracks: Song[] = items.map((track) => ({
    artists: track.artists.map((_artist) => ({
      name: _artist.name,
      externalUrl: _artist.external_urls.spotify,
    })),
    preview: track.preview_url ? track.preview_url : null,
    duration_Ms: track.duration_ms,
    songUrl: track.external_urls.spotify,
    image: track.album.images ? track.album.images[0].url : undefined,
    title: track.name,
  }));

  return tracks;
};

export const getTopArtists = async (accessToken: string) => {
  const res = await fetch(TOP_ARTIST_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json: any = await res.json();

  return json.items;
};

export const getShows = async (accessToken: string) => {
  const response = await fetch(SHOWS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const shows = await response.json();

  return shows;
};
