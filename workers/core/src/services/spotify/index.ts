import {
  SpotifyTrackSchema,
  Track,
  SpotifyShowSchema,
  Show,
  SpotifyArtistSchema,
  Artist,
} from "@/types/spotify";

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks?limit=10`;
const TOP_ARTIST_ENDPOINT = `https://api.spotify.com/v1/me/top/artists?limit=21`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const SHOWS_ENDPOINT = "https://api.spotify.com/v1/me/shows?limit=12";

export const getSpotifyAccessToken = async (
  SPOTIFY_CLIENT_ID: string,
  SPOTIFY_CLIENT_SECRET: string,
  REFRESH_TOKEN: string,
  kv: KVNamespace
) => {
  const cachedToken = await kv.get("spotify:access_token");
  const tokenExpiryStr = await kv.get("spotify:token_expiry");

  let expiry;
  if (tokenExpiryStr) {
    expiry = new Date(tokenExpiryStr);
  }

  const now = new Date();
  const timeDifference = expiry ? expiry.getTime() - now.getTime() : null;

  if (cachedToken && timeDifference && timeDifference >= 59 * 60 * 1000) {
    return cachedToken;
  }

  const basic = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });

  const json: any = await response.json();

  const accessToken = json.access_token;
  const expiresIn = json.expires_in;
  const expiryDate = new Date(now.getTime() + expiresIn * 1000);

  await kv.put("spotify:access_token", accessToken);
  await kv.put("spotify:token_expiry", expiryDate.toISOString());

  return accessToken;
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
  const tracks: Track[] = items.map((track) => ({
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
  const response = await fetch(TOP_ARTIST_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { items } = (await response.json()) as {
    items: SpotifyArtistSchema[];
  };

  const artists: Artist[] = items.map((artist) => ({
    name: artist.name,
    image: artist.images[0].url,
    url: artist.external_urls.spotify,
    genres: artist.genres,
    followers: artist.followers.total,
    popularity: artist.popularity,
  }));

  return artists;
};

export const getShows = async (accessToken: string) => {
  const response = await fetch(SHOWS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { items } = (await response.json()) as {
    items: SpotifyShowSchema[];
  };

  const shows: Show[] = items.map((show) => ({
    name: show.show.name,
    publisher: show.show.publisher,
    description: show.show.description,
    image: show.show.images[0].url,
    id: show.show.id,
    url: show.show.external_urls.spotify,
  }));

  return shows;
};

export const getNowPlaying = async (accessToken: string) => {
  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
