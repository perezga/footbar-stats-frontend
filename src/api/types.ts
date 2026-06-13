// Manually mirrors the backend's src/footbar/types.ts and src/rfaf/types.ts
// (plus its route response shapes) — update both sides together.
export type FavFoot = 'r' | 'l' | 'b' | 'n';
export type Gender = 'm' | 'f';
export type MatchType = '11' | 'ss' | 'tr' | 'ru';
export type Position =
  | 'gk'
  | 'rb'
  | 'cb'
  | 'lb'
  | 'rwb'
  | 'lwb'
  | 'cdm'
  | 'cm'
  | 'cam'
  | 'rm'
  | 'lm'
  | 'rw'
  | 'lw'
  | 'cf'
  | 'st';
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

/** One of the tracked player's in-match events (goals, cards). */
export interface PlayerMatchEvent {
  kind: 'goal' | 'yellow' | 'red' | 'second_yellow' | 'other';
  /** Raw Universo RFAF event type (e.g. 'gol_100'). */
  type: string;
  minute: number | null;
}

/** RFAF fixture linked to a session by date (fixture is the source of truth). */
export interface SessionFixture {
  matchday: number;
  home: string;
  away: string;
  opponent: string;
  is_home: boolean;
  date: string | null;
  time: string | null;
  home_goals: number | null;
  away_goals: number | null;
  our_goals: number | null;
  their_goals: number | null;
  result: RfafForm | null;
  /** The tracked player's events in this match (goals, cards). */
  events: PlayerMatchEvent[];
  /** Titular (true) / suplente (false); undefined when there's no player-match row. */
  started?: boolean;
  captain?: boolean;
}

/** The opposite league leg vs the same opponent, merged into this row. */
export interface OtherLeg {
  /** Footbar session id of that leg, or null if it wasn't recorded. */
  session_id: number | null;
  fixture: SessionFixture;
  position?: Position;
  score_stars?: number;
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
  fixture?: SessionFixture;
  /** Which league leg this row is (1 = ida, 2 = vuelta) when legs are merged. */
  leg?: 1 | 2;
  other_leg?: OtherLeg;
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
  /** May be missing on older cached details. */
  dribble_count?: number;
}

/** Mean of one metric over the recent-sessions window (n = sessions with data). */
export interface MetricAverage {
  mean: number;
  n: number;
}

export interface AveragesResponse {
  match_type: MatchType | null;
  window: number;
  /** Sessions in the comparison pool (cached details only). */
  count: number;
  averages: Record<string, MetricAverage | undefined>;
}

/** RFAF fixture with no Footbar session (id null → no stats, not clickable). */
export interface FixtureOnlyItem {
  id: null;
  start_date: string;
  stop_date: string;
  title: string;
  match_type: '11';
  fixture: SessionFixture;
  /** Which league leg this row is (1 = ida, 2 = vuelta) when legs are merged. */
  leg?: 1 | 2;
  other_leg?: OtherLeg;
  /** Never present; declared so union access typechecks without narrowing. */
  position?: undefined;
  score_stars?: undefined;
}

/** One row of the merged matches+sessions feed. */
export type MatchListItem = SessionListItem | FixtureOnlyItem;

export interface SessionListResponse {
  count: number;
  results: MatchListItem[];
  last_sync: number;
}

export interface RecordEntry {
  metric: string;
  value: number;
  /** Null when the record's match has no Footbar session (fixture-only). */
  session_id: number | null;
  session_title: string;
  start_date: string;
}

export interface TrendPoint {
  /** Null when the point's match has no Footbar session (fixture-only). */
  session_id: number | null;
  start_date: string;
  title: string;
  value: number;
}

// --- Player level (derived from the last matches) ---

export type PlayerLevelId = 'principiante' | 'novato' | 'amateur' | 'pro' | 'goat';

export interface LevelReason {
  metric: string;
  /** Criterion name shown to the user (Spanish, like the profile UI). */
  label: string;
  /** Formatted value ('5.2 km', '27.4 km/h'). */
  display: string;
  /** Level this criterion alone would give (0..4). */
  level: number;
  level_name: PlayerLevelId;
}

export interface LevelMatchRef {
  session_id: number;
  title: string;
  start_date: string;
}

export interface LevelResponse {
  /** Null when no match details are cached yet. */
  level: PlayerLevelId | null;
  level_index: number | null;
  window: number;
  /** The matches the level was derived from (newest first). */
  matches: LevelMatchRef[];
  reasons: LevelReason[];
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

/** One named counter in the player stats ("Convocados", "Total Goles", …). */
export interface PlayerStatLine {
  name: string;
  value: number;
}

/** The tracked player's cumulative season statistics from Universo RFAF. */
export interface PlayerStats {
  player_id: string;
  player: string;
  team: string;
  team_id: number | null;
  dorsal: number | null;
  age: number | null;
  category: string;
  season_id: string;
  /** Season label (e.g. '2026-2027'). */
  season: string;
  minutes_played: number | null;
  minutes_per_game: number | null;
  stats: PlayerStatLine[];
  cards: PlayerStatLine[];
  photo_url: string | null;
}

export interface PlayerStatsResponse {
  results: PlayerStats;
  fetched_at: number;
}

/** One selectable season ('22' = 2026-2027). */
export interface Season {
  id: string;
  name: string;
}

export interface SeasonsResponse extends RfafResponse<Season> {
  /** Season id the backend defaults to when none is selected. */
  current: string;
}
