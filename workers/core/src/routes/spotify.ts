import { HonoConfig } from "@/config";
import {
  getNowPlaying,
  getShows,
  getSpotifyAccessToken,
  getTopArtists,
  getTopTracks,
} from "@/services/spotify";
import { Hono } from "hono";

const app = new Hono<HonoConfig>();

app.get("/top-tracks", async (c) => {
  const refreshToken = await getSpotifyAccessToken(
    c.env.SPOTIFY_CLIENT_ID,
    c.env.SPOTIFY_CLIENT_SECRET,
    c.env.SPOTIFY_REFRESH_TOKEN,
    c.env.YUTA_STUDIO
  );

  const tracks = await getTopTracks(refreshToken);

  return c.json(tracks);
});

app.get("/top-artists", async (c) => {
  const refreshToken = await getSpotifyAccessToken(
    c.env.SPOTIFY_CLIENT_ID,
    c.env.SPOTIFY_CLIENT_SECRET,
    c.env.SPOTIFY_REFRESH_TOKEN,
    c.env.YUTA_STUDIO
  );

  const artists = await getTopArtists(refreshToken);

  return c.json(artists);
});

app.get("/shows", async (c) => {

  console.log(c.env.SPOTIFY_CLIENT_ID);

  const refreshToken = await getSpotifyAccessToken(
    c.env.SPOTIFY_CLIENT_ID,
    c.env.SPOTIFY_CLIENT_SECRET,
    c.env.SPOTIFY_REFRESH_TOKEN,
    c.env.YUTA_STUDIO
  );

  const shows = await getShows(refreshToken);

  return c.json(shows);
});

app.get("/now-playing", async (c) => {
  const refreshToken = await getSpotifyAccessToken(
    c.env.SPOTIFY_CLIENT_ID,
    c.env.SPOTIFY_CLIENT_SECRET,
    c.env.SPOTIFY_REFRESH_TOKEN,
    c.env.YUTA_STUDIO
  );

  const response = await getNowPlaying(refreshToken);

  if (response.status === 204 || response.status > 400) {
    return new Response(JSON.stringify({ isPlaying: false }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  const song: any = await response.json();

  if (song.item === null) {
    return new Response(JSON.stringify({ isPlaying: false }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  const isPlaying = song.is_playing;
  const title = song.item.name;
  const artists = song.item.artists.map((_artist: any) => ({
    name: _artist.name,
    externalUrl: _artist.external_urls.spotify,
  }));
  const album = song.item.album.name;
  const albumImageUrl = song.item.album.images[0].url;
  const songUrl = song.item.external_urls.spotify;

  return new Response(
    JSON.stringify({
      album,
      albumImageUrl,
      artists,
      isPlaying,
      songUrl,
      title,
    }),
    {
      status: 200,
    }
  );
});

export default app;
