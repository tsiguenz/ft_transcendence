export interface MapInfos {
  height: number;
  width: number;
  padOffset: number;
  acceleration: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  defaultBallSpeed: number;
  speed: number;
  dx: number;
  dy: number;
}

export interface Pad {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dy: number;
}

export interface PadInfos {
  height: number;
  width: number;
  speed: number;
}

export interface Score {
  player1: { id: string; points: number };
  player2: { id: string; points: number };
}

export interface Player {
  id: string;
  ladderPoints: number;
}

export interface GameDatas {
  isRanked: boolean;
  map: MapInfos;
  padInfos: PadInfos;
  ball: Ball;
  pad1: Pad;
  pad2: Pad;
  score: Score;
}

export interface Room {
  isStarted: boolean;
  interval?: NodeJS.Timeout;
  players: Array<string>;
  datas?: GameDatas;
}
