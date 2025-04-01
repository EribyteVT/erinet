export type Stream = {
  stream_id: number;
  stream_date: string;
  streamer_id: string;
  stream_name: string;
  event_id?: string;
  twitch_segment_id?: string;
  duration?: number;
  category_id?: null;
};

export type Streamer = {
  streamer_id: number;
  streamer_name: string;
  timezone: string;
  guild: string;
  level_system?: string;
  level_ping_role?: string;
  level_channel?: number;
  twitch_user_id?: null;
  auto_discord_event?: string;
  auto_twitch_schedule?: string;
};

export type StreamDataResponse = {
  response: string;
  data: Stream;
};

export type StreamsDataResponse = {
  response: string;
  data: Stream[];
};

export type StreamerDataResponse = {
  response: string;
  data: Streamer;
};

export type GuildData = {
  id: string;
  name: string;
  icon: string;
  banner: string;
  permissions: string;
};

export type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
};
