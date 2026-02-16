import { Grid } from './Grid';
import { Player } from './Player';
import { Shape, createRandomShape } from './Shape';
import {
    GRID_WIDTH, GRID_HEIGHT,
    DIFFICULTY_LEVELS, DifficultyLevel,
    ComboState, COMBO_MULTIPLIERS,
    WaveState,
    PowerUpType, PowerUp, ActivePowerUp,
    POWER_UP_DURATION, POWER_UP_DROP_CHANCE,
    Particle, Bullet,
    calculateRectangleScore,
} from './types';

export class GameEngine {
    grid: Grid;
    players: Player[];
    shapes: Shape[];
    bullets: Bullet[];
    gameOver: boolean;
    score: number;
    frameCount: number = 0;

    // ── Difficulty ──────────────────────────────
    currentDifficulty: DifficultyLevel;
    difficultyIndex: number = 0;
    gameSpeed: number;
    shapeSpawnRate: number;
    framesSinceSpawn: number = 0;

    // Breathing waves
    wave: WaveState = {
        active: false,
        timer: 0,
        intenseDuration: 360,   // 6 seconds intense
        calmDuration: 240,      // 4 seconds calm
        calmSpeedMultiplier: 0.6,
    };

    // Smooth speed transitions
    private targetSpeed: number;
    private speedLerp: number = 0.005; // smoothing factor

    // ── Combos ──────────────────────────────────
    combo: ComboState = {
        count: 0,
        multiplier: 1,
        timer: 0,
        maxWindow: 150, // ≈2.5s at 60fps
        displayTimer: 0,
    };

    // ── Power-ups ───────────────────────────────
    fallingPowerUps: PowerUp[] = [];
    activePowerUps: ActivePowerUp[] = [];

    // ── Particles ───────────────────────────────
    particles: Particle[] = [];

    // ── Stats ───────────────────────────────────
    totalRectangles: number = 0;
    maxCombo: number = 0;
    shotsTotal: number = 0;
    shotsHit: number = 0;

    constructor() {
        this.grid = new Grid();
        this.players = [
            new Player(1, Math.floor(GRID_WIDTH / 3), '#ef4444'),
            new Player(2, Math.floor(2 * GRID_WIDTH / 3), '#3b82f6'),
        ];
        this.shapes = [];
        this.bullets = [];
        this.gameOver = false;
        this.score = 0;

        this.currentDifficulty = DIFFICULTY_LEVELS[0];
        this.gameSpeed = this.currentDifficulty.speed;
        this.targetSpeed = this.gameSpeed;
        this.shapeSpawnRate = this.currentDifficulty.spawnRate;
    }

    // ═══════════════════════════════════════════
    // MAIN UPDATE
    // ═══════════════════════════════════════════

    update() {
        if (this.gameOver) return;
        this.frameCount++;

        // Animate players
        this.players.forEach(p => p.animate());

        // Update difficulty
        this.updateDifficulty();

        // Update breathing wave
        this.updateWave();

        // Combo timer countdown
        this.updateCombo();

        // Active power-ups countdown
        this.updateActivePowerUps();

        // Calculate effective speed (wave + power-up modifiers)
        const effectiveSpeed = this.getEffectiveSpeed();

        // Spawn shapes
        this.spawnShapes();

        // Move shapes (unless frozen)
        if (!this.hasPowerUp(PowerUpType.TIME_FREEZE)) {
            this.moveShapes(effectiveSpeed);
        }

        // Move bullets
        this.updateBullets();

        // Move falling power-ups
        this.updateFallingPowerUps(effectiveSpeed);

        // Update particles
        this.updateParticles();
    }

    // ═══════════════════════════════════════════
    // DIFFICULTY SYSTEM
    // ═══════════════════════════════════════════

    private updateDifficulty() {
        // Find the highest matching difficulty level
        let newIdx = 0;
        for (let i = DIFFICULTY_LEVELS.length - 1; i >= 0; i--) {
            if (this.score >= DIFFICULTY_LEVELS[i].minScore) {
                newIdx = i;
                break;
            }
        }

        if (newIdx !== this.difficultyIndex) {
            this.difficultyIndex = newIdx;
            this.currentDifficulty = DIFFICULTY_LEVELS[newIdx];

            // Smooth transition to new speed
            this.targetSpeed = this.currentDifficulty.speed;
            this.shapeSpawnRate = this.currentDifficulty.spawnRate;

            // Celebrate level up with particles
            this.spawnLevelUpParticles();
        }

        // Smooth speed interpolation
        this.gameSpeed += (this.targetSpeed - this.gameSpeed) * this.speedLerp;

        // Micro-increase within a level to keep things fresh
        const progressInLevel = this.getProgressInLevel();
        const microBoost = progressInLevel * 0.004; // tiny ramp within each tier
        this.gameSpeed += microBoost * this.speedLerp;
    }

    private getProgressInLevel(): number {
        const curr = DIFFICULTY_LEVELS[this.difficultyIndex];
        const next = DIFFICULTY_LEVELS[this.difficultyIndex + 1];
        if (!next) return 1; // max level
        return Math.min(1, (this.score - curr.minScore) / (next.minScore - curr.minScore));
    }

    // ═══════════════════════════════════════════
    // BREATHING WAVE SYSTEM
    // ═══════════════════════════════════════════

    private updateWave() {
        // Only activate waves from difficulty 2+
        if (this.difficultyIndex < 2) {
            this.wave.active = false;
            this.wave.timer = 0;
            return;
        }

        this.wave.timer--;
        if (this.wave.timer <= 0) {
            this.wave.active = !this.wave.active;
            this.wave.timer = this.wave.active
                ? this.wave.intenseDuration
                : this.wave.calmDuration;
        }
    }

    private getEffectiveSpeed(): number {
        let speed = this.gameSpeed;

        // Wave calm phase modifier
        if (!this.wave.active && this.wave.timer > 0) {
            speed *= this.wave.calmSpeedMultiplier;
        }

        // Slow motion power-up
        if (this.hasPowerUp(PowerUpType.SLOW_MOTION)) {
            speed *= 0.4;
        }

        return speed;
    }

    // ═══════════════════════════════════════════
    // COMBO SYSTEM
    // ═══════════════════════════════════════════

    private updateCombo() {
        if (this.combo.timer > 0) {
            this.combo.timer--;
            if (this.combo.timer <= 0) {
                // Combo expired
                this.combo.count = 0;
                this.combo.multiplier = 1;
            }
        }
        if (this.combo.displayTimer > 0) {
            this.combo.displayTimer--;
        }
    }

    private registerCombo() {
        this.combo.count++;
        this.combo.timer = this.combo.maxWindow;
        this.combo.displayTimer = 90; // 1.5s display
        const idx = Math.min(this.combo.count, COMBO_MULTIPLIERS.length - 1);
        this.combo.multiplier = COMBO_MULTIPLIERS[idx];
        if (this.combo.count > this.maxCombo) this.maxCombo = this.combo.count;
    }

    // ═══════════════════════════════════════════
    // POWER-UPS
    // ═══════════════════════════════════════════

    private updateActivePowerUps() {
        this.activePowerUps = this.activePowerUps.filter(p => {
            p.remaining--;
            return p.remaining > 0;
        });
    }

    private updateFallingPowerUps(speed: number) {
        this.fallingPowerUps = this.fallingPowerUps.filter(pu => {
            pu.y += speed * 1.5;

            // Check if player picks it up (bottom row)
            if (pu.y >= GRID_HEIGHT - 1) {
                // Check if any player is on this column
                for (const player of this.players) {
                    if (player.x === Math.floor(pu.x)) {
                        this.activatePowerUp(pu.type, player.id);
                        this.spawnPowerUpParticles(pu.x, pu.y, pu.type);
                        return false; // remove
                    }
                }
                // Missed → remove
                if (pu.y > GRID_HEIGHT + 1) return false;
            }
            return true;
        });
    }

    hasPowerUp(type: PowerUpType): boolean {
        return this.activePowerUps.some(p => p.type === type);
    }

    private hasPlayerPowerUp(type: PowerUpType, playerId: number): boolean {
        return this.activePowerUps.some(p => p.type === type && p.owner === playerId);
    }

    private activatePowerUp(type: PowerUpType, playerId: number) {
        // Remove existing of same type for this player
        this.activePowerUps = this.activePowerUps.filter(
            p => !(p.type === type && p.owner === playerId)
        );
        this.activePowerUps.push({
            type,
            remaining: POWER_UP_DURATION,
            owner: playerId,
        });
    }

    private trySpawnPowerUp(x: number, y: number) {
        if (Math.random() < POWER_UP_DROP_CHANCE) {
            const types = Object.values(PowerUpType);
            const type = types[Math.floor(Math.random() * types.length)] as PowerUpType;
            this.fallingPowerUps.push({ type, x, y, speed: 0.02 });
        }
    }

    // ═══════════════════════════════════════════
    // SHAPE SPAWNING & MOVEMENT
    // ═══════════════════════════════════════════

    private spawnShapes() {
        this.framesSinceSpawn++;
        let effectiveRate = this.shapeSpawnRate;

        // During intense waves, spawn faster
        if (this.wave.active) {
            effectiveRate = Math.floor(effectiveRate * 0.65);
        }

        if (this.framesSinceSpawn > effectiveRate) {
            this.shapes.push(createRandomShape());
            this.framesSinceSpawn = 0;
        }
    }

    private moveShapes(speed: number) {
        for (const shape of this.shapes) {
            shape.moveDown(speed);
            const maxShapeY = Math.max(...shape.getAbsolutePoints().map(p => p.y));
            if (maxShapeY >= GRID_HEIGHT - 1) {
                this.gameOver = true;
            }
        }
    }

    // ═══════════════════════════════════════════
    // BULLETS
    // ═══════════════════════════════════════════

    private updateBullets() {
        const bulletsToRemove: number[] = [];
        const shapesToRemove: number[] = [];

        this.bullets.forEach((bullet, bIdx) => {
            bullet.y -= bullet.speed;

            if (bullet.y < 0) {
                bulletsToRemove.push(bIdx);
                return;
            }

            // Check collision with falling power-ups
            for (let i = this.fallingPowerUps.length - 1; i >= 0; i--) {
                const pu = this.fallingPowerUps[i];
                if (Math.floor(bullet.x) === Math.floor(pu.x) &&
                    Math.abs(bullet.y - pu.y) < 1) {
                    this.activatePowerUp(pu.type, bullet.owner);
                    this.spawnPowerUpParticles(pu.x, pu.y, pu.type);
                    this.fallingPowerUps.splice(i, 1);
                    bulletsToRemove.push(bIdx);
                    return;
                }
            }

            // Check collision with shapes
            for (let sIdx = 0; sIdx < this.shapes.length; sIdx++) {
                const shape = this.shapes[sIdx];
                const shapePoints = shape.getAbsolutePoints();

                const hitPoint = shapePoints.find(
                    p => p.x === bullet.x && Math.floor(bullet.y) === p.y
                );
                if (hitPoint) {
                    this.shotsHit++;
                    const attachY = Math.ceil(bullet.y) + 1;
                    const relX = bullet.x - shape.x;
                    const relY = attachY - Math.floor(shape.y);

                    const added = shape.addBlock(relX, relY);
                    if (added) {
                        bulletsToRemove.push(bIdx);

                        // Spark particles at impact
                        this.spawnImpactParticles(bullet.x, bullet.y, bullet.owner);

                        if (shape.isPerfectRectangle()) {
                            // Register combo first
                            this.registerCombo();
                            this.totalRectangles++;

                            // Calculate enhanced score
                            const w = shape.width;
                            const h = shape.height;
                            const pts = calculateRectangleScore(w, h, this.combo.multiplier);
                            this.score += pts;

                            // Rectangle clear particles
                            this.spawnRectangleClearParticles(shape);

                            // Try to drop a power-up from center of cleared shape
                            const cx = shape.x + w / 2;
                            const cy = Math.floor(shape.y) + h / 2;
                            this.trySpawnPowerUp(cx, cy);

                            shapesToRemove.push(sIdx);
                        }
                    }
                    break;
                }
            }
        });

        bulletsToRemove.sort((a, b) => b - a).forEach(idx => this.bullets.splice(idx, 1));
        shapesToRemove.sort((a, b) => b - a).forEach(idx => this.shapes.splice(idx, 1));
    }

    // ═══════════════════════════════════════════
    // PLAYER ACTIONS
    // ═══════════════════════════════════════════

    movePlayer(playerId: number, direction: -1 | 1) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        const newX = player.x + direction;
        const otherPlayer = this.players.find(p => p.id !== playerId);
        if (otherPlayer && otherPlayer.x === newX) return;

        if (newX >= 0 && newX < GRID_WIDTH) {
            player.x = newX;
        }
    }

    playerShoot(playerId: number) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        const maxBullets = this.hasPlayerPowerUp(PowerUpType.RAPID_FIRE, playerId) ? 8 : 3;
        const myBullets = this.bullets.filter(b => b.owner === playerId);
        if (myBullets.length >= maxBullets) return;

        this.shotsTotal++;
        player.recoil = 1.0;

        if (this.hasPlayerPowerUp(PowerUpType.MULTI_SHOT, playerId)) {
            // Triple shot spread
            const offsets = [-1, 0, 1];
            for (const off of offsets) {
                const bx = player.x + off;
                if (bx >= 0 && bx < GRID_WIDTH) {
                    this.bullets.push({ x: bx, y: GRID_HEIGHT - 1, owner: playerId, speed: 1 });
                }
            }
        } else {
            this.bullets.push({ x: player.x, y: GRID_HEIGHT - 1, owner: playerId, speed: 1 });
        }
    }

    // ═══════════════════════════════════════════
    // PARTICLE SYSTEM
    // ═══════════════════════════════════════════

    private updateParticles() {
        this.particles = this.particles.filter(p => {
            p.life -= 1 / p.maxLife;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.015; // gravity
            p.vx *= 0.98;  // friction
            p.alpha = Math.max(0, p.life);
            p.size *= 0.995;
            return p.life > 0;
        });
    }

    private spawnImpactParticles(x: number, y: number, owner: number) {
        const color = owner === 1 ? '#ef4444' : '#3b82f6';
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 0.08,
                vy: Math.sin(angle) * 0.08 - 0.02,
                life: 1,
                maxLife: 25 + Math.random() * 15,
                size: 3 + Math.random() * 3,
                color,
                type: 'spark',
                alpha: 1,
            });
        }
    }

    spawnRectangleClearParticles(shape: Shape) {
        const points = shape.getAbsolutePoints();
        const colors = ['#fbbf24', '#f59e0b', '#fef3c7', '#ffffff'];
        for (const pt of points) {
            for (let i = 0; i < 4; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.05 + Math.random() * 0.15;
                this.particles.push({
                    x: pt.x + 0.5,
                    y: pt.y + 0.5,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 0.06,
                    life: 1,
                    maxLife: 35 + Math.random() * 25,
                    size: 4 + Math.random() * 5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    type: Math.random() > 0.5 ? 'star' : 'glow',
                    alpha: 1,
                });
            }
        }
    }

    private spawnPowerUpParticles(x: number, y: number, type: PowerUpType) {
        const color = {
            [PowerUpType.RAPID_FIRE]: '#ef4444',
            [PowerUpType.MULTI_SHOT]: '#f59e0b',
            [PowerUpType.TIME_FREEZE]: '#06b6d4',
            [PowerUpType.SLOW_MOTION]: '#8b5cf6',
        }[type];

        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.06 + Math.random() * 0.12;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 30 + Math.random() * 20,
                size: 3 + Math.random() * 6,
                color,
                type: 'ring',
                alpha: 1,
            });
        }
    }

    private spawnLevelUpParticles() {
        const color = this.currentDifficulty.color;
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                x: Math.random() * GRID_WIDTH,
                y: GRID_HEIGHT + 1,
                vx: (Math.random() - 0.5) * 0.2,
                vy: -(0.15 + Math.random() * 0.25),
                life: 1,
                maxLife: 50 + Math.random() * 30,
                size: 3 + Math.random() * 5,
                color,
                type: 'star',
                alpha: 1,
            });
        }
    }
}
