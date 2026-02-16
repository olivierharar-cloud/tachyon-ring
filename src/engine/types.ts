export type Point = { x: number; y: number };

export type BlockType = 'empty' | 'solid' | 'player1' | 'player2';

export interface Block {
    type: BlockType;
    color?: string;
    id?: number;
}

export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 20;
export const BLOCK_SIZE = 30;

// ──────────────────────────────────────────────
// Phase 1: Difficulty System
// ──────────────────────────────────────────────

export interface DifficultyLevel {
    name: string;
    minScore: number;
    speed: number;         // cells per frame
    spawnRate: number;      // frames between spawns
    color: string;          // HUD indicator color
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
    { name: 'Débutant', minScore: 0, speed: 0.012, spawnRate: 280, color: '#22d3ee' },
    { name: 'Normal', minScore: 1000, speed: 0.018, spawnRate: 220, color: '#34d399' },
    { name: 'Rapide', minScore: 3000, speed: 0.026, spawnRate: 170, color: '#fbbf24' },
    { name: 'Intense', minScore: 6000, speed: 0.034, spawnRate: 130, color: '#fb923c' },
    { name: 'Expert', minScore: 10000, speed: 0.042, spawnRate: 100, color: '#f87171' },
    { name: 'Tachyon', minScore: 16000, speed: 0.052, spawnRate: 75, color: '#e879f9' },
];

// "Breathing" wave system — alternates intensity
export interface WaveState {
    active: boolean;       // true = intense wave
    timer: number;         // frames remaining
    intenseDuration: number;  // frames for intense phase
    calmDuration: number;     // frames for calm phase
    calmSpeedMultiplier: number; // e.g. 0.65
}

// ──────────────────────────────────────────────
// Phase 1: Combo System
// ──────────────────────────────────────────────

export interface ComboState {
    count: number;           // current combo streak
    multiplier: number;      // score multiplier
    timer: number;           // frames left in combo window
    maxWindow: number;       // frames allowed between clears (≈2s at 60fps)
    displayTimer: number;    // how long to show the combo text
}

export const COMBO_MULTIPLIERS = [1, 1.5, 2, 2.5, 3, 4]; // indexed by min(comboCount, 5)

// ──────────────────────────────────────────────
// Phase 1: Power-up System
// ──────────────────────────────────────────────

export enum PowerUpType {
    RAPID_FIRE = 'RAPID_FIRE',
    MULTI_SHOT = 'MULTI_SHOT',
    TIME_FREEZE = 'TIME_FREEZE',
    SLOW_MOTION = 'SLOW_MOTION',
}

export interface PowerUp {
    type: PowerUpType;
    x: number;
    y: number;    // falling position (float)
    speed: number;
}

export interface ActivePowerUp {
    type: PowerUpType;
    remaining: number; // frames
    owner: number;     // player id
}

export const POWER_UP_COLORS: Record<PowerUpType, string> = {
    [PowerUpType.RAPID_FIRE]: '#ef4444',
    [PowerUpType.MULTI_SHOT]: '#f59e0b',
    [PowerUpType.TIME_FREEZE]: '#06b6d4',
    [PowerUpType.SLOW_MOTION]: '#8b5cf6',
};

export const POWER_UP_ICONS: Record<PowerUpType, string> = {
    [PowerUpType.RAPID_FIRE]: '⚡',
    [PowerUpType.MULTI_SHOT]: '◆',
    [PowerUpType.TIME_FREEZE]: '❄',
    [PowerUpType.SLOW_MOTION]: '◎',
};

export const POWER_UP_DURATION = 300; // 5 seconds at 60fps
export const POWER_UP_DROP_CHANCE = 0.20; // 20% on rectangle completion

// ──────────────────────────────────────────────
// Phase 1: Particle System
// ──────────────────────────────────────────────

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;     // 0..1
    maxLife: number;
    size: number;
    color: string;
    type: 'spark' | 'glow' | 'star' | 'ring';
    alpha: number;
}

// ──────────────────────────────────────────────
// Phase 1: Scoring
// ──────────────────────────────────────────────

export function calculateRectangleScore(width: number, height: number, comboMultiplier: number): number {
    const area = width * height;
    const baseScore = area * 100;
    const sizeBonus = Math.pow(1.4, Math.min(area - 2, 12));
    return Math.floor(baseScore * sizeBonus * comboMultiplier);
}

// ──────────────────────────────────────────────
// Bullet with enhanced properties
// ──────────────────────────────────────────────

export interface Bullet {
    x: number;
    y: number;
    owner: number;
    speed: number;   // cells per frame (default 1)
}
