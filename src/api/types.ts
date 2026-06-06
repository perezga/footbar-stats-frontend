export type FavFoot = 'r' | 'l' | 'b' | 'n';
export type Gender = 'm' | 'f';
export type MatchType = '11' | 'ss' | 'tr' | 'ru';
export type Position =
  | 'gk' | 'rb' | 'cb' | 'lb' | 'rwb' | 'lwb'
  | 'cdm' | 'cm' | 'cam' | 'rm' | 'lm' | 'rw' | 'lw' | 'cf' | 'st';
export type Strength = 'tec' | 'pac' | 'sta' | 'sho' | 'un';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number] | [number, number, number];
}

export interface Profile {
  user_id: number;
  nickname: string;
  fav_foot: FavFoot | null;
  fav_position: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  d_o_b: string;
  profile_pic: string;
  age_category: string;
  height: number;
  weight: number;
  strength: Strength;
  country_flag: string;
}

export interface SessionListItem {
  id: number;
  start_date: string;
  stop_date: string;
  title: string;
  location: GeoPoint;
  match_type: MatchType;
  position?: Position;
  score_stars?: number;
}

export interface DistanceBin {
  index: string;
  low: number;
  normal: number;
  high: number;
}

export interface SessionDetail extends SessionListItem {
  playing_time: number;
  distance: number;
  pass_count: number;
  shot_count: number;
  shot_speed: number;
  avg_shot_speed: number;
  time_with_ball: number;
  activity: number;
  time_running: number;
  run_count: number | null;
  sprint_count: number;
  avg_sprint_speed: number;
  sprint_speed: number;
  hsr_plus: number;
  stop_and_go: number | null;
  acceleration: number | null;
  distance_5min: DistanceBin[] | null;
}

export interface SessionListResponse {
  count: number;
  results: SessionListItem[];
  last_sync: number;
}

export interface RecordEntry {
  metric: string;
  value: number;
  session_id: number;
  session_title: string;
  start_date: string;
}

export interface TrendPoint {
  session_id: number;
  start_date: string;
  title: string;
  value: number;
}

// --- RFAF league data ---

export type RfafForm = 'W' | 'D' | 'L';

export interface Standing {
  position: number;
  team: string;
  codequipo: number | null;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  form: RfafForm[];
  own?: boolean;
}

export interface Scorer {
  rank: number;
  player: string;
  team: string;
  group: string;
  played: number;
  goals: number;
  penalties: number;
  goals_per_game: number;
  own?: boolean;
}

export interface Fixture {
  matchday: number;
  home: string;
  away: string;
  date: string | null;
  time: string | null;
  home_goals: number | null;
  away_goals: number | null;
  result: RfafForm | null;
}

export interface RfafResponse<T> {
  results: T[];
  fetched_at: number;
}
