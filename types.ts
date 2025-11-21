export enum GamePhase {
  INTRO,
  OVERWORLD,
  DIALOGUE, // Overworld dialogue
  BATTLE,
  GAME_OVER,
  ENDING
}

export enum LocationId {
  BEDROOM = 'BEDROOM',
  DOLANDIRICILAR_SOKAGI = 'DOLANDIRICILAR_SOKAGI',
  KARANLIK_ARACI_PAZARI = 'KARANLIK_ARACI_PAZARI',
  SMS_MAGARASI = 'SMS_MAGARASI',
  WEXA_OFIS = 'WEXA_OFIS'
}

export interface Position {
  x: number;
  y: number;
}

export interface MapDefinition {
  id: LocationId;
  width: number;
  height: number;
  tileSize: number;
  layout: number[][]; // 0: Walkable, 1: Wall, 2: Door/Exit, 3: NPC
  doors: { x: number; y: number; target: LocationId; targetX: number; targetY: number }[];
  npcs: { id: string; x: number; y: number; sprite: string }[];
  playerStart: Position;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  lv: number;
  xp: number;
  items: string[];
  gold: number;
  name: string;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  dialogues: string[];
  acts: {
    name: string;
    description: string;
    response: string;
    effect?: 'HEAL' | 'SPARE_READY' | 'ANNOY' | 'NOTHING';
  }[];
  spared: boolean;
  description: string;
  spriteColor: string;
  bulletPattern: 'SIMPLE' | 'WAVE' | 'CHASING' | 'RANDOM_BOX';
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  face?: string;
  next?: string; // id of next node
  triggerBattle?: string; // enemy ID to start battle
  triggerMove?: LocationId; // Force move
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
}