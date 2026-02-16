import { GRID_WIDTH, Point } from './types';

export class Player {
    x: number;
    color: string;
    id: number;

    // Ship visual properties
    glowPhase: number = 0;       // animated glow oscillation
    thrustPhase: number = 0;     // thruster animation
    lastShotFrame: number = 0;   // for recoil animation
    recoil: number = 0;          // visual kick-back on shoot

    constructor(id: number, startX: number, color: string) {
        this.id = id;
        this.x = startX;
        this.color = color;
    }

    move(direction: -1 | 1) {
        this.x += direction;
        if (this.x < 0) this.x = 0;
        if (this.x >= GRID_WIDTH) this.x = GRID_WIDTH - 1;
    }

    shoot(): Point {
        this.recoil = 1.0; // start recoil animation
        return { x: this.x, y: 20 };
    }

    /** Call every frame to animate the ship */
    animate() {
        this.glowPhase += 0.06;
        this.thrustPhase += 0.12;
        if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - 0.08);
    }
}
