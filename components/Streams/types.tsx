export type Stream = {
  stream_id: number;
  stream_date: Date;
  streamer_id: string;
  stream_name: string;
  event_id?: string | null;
  twitch_segment_id?: string | null;
  duration?: number | null;
  category_id?: string | null ;
};

export type Streamer = {
  streamer_id: number;
  streamer_name: string;
  timezone: string;
  guild: string;
  level_system?: string | null;
  level_ping_role?: string | null;
  level_channel?: string | null;
  twitch_user_id?: string | null;
  auto_discord_event?: string | null;
  auto_twitch_schedule?: string | null;
};

export type StreamDataResponse = {
  response: string;
  data: Stream | null;
  message: string
};

export type StreamsDataResponse = {
  response: string;
  data: Stream[] | null;
  message:string
};

export type StreamerDataResponse = {
  response: string;
  data: Streamer | null;
  message:string
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
