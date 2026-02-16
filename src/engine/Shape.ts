import { Point, BlockType, GRID_WIDTH } from './types';

export class Shape {
    points: Point[]; // Relative to (x, y)
    x: number;
    y: number; // Top-left visual position (can be float)
    type: BlockType;
    id: number;
    width: number;
    height: number;

    constructor(x: number, y: number, points: Point[], type: BlockType = 'solid') {
        this.x = x;
        this.y = y;
        this.points = points;
        this.type = type;
        this.id = Math.random();
        this.recalcBounds();
    }

    recalcBounds() {
        if (this.points.length === 0) {
            this.width = 0;
            this.height = 0;
            return;
        }
        const xs = this.points.map(p => p.x);
        const ys = this.points.map(p => p.y);
        this.width = Math.max(...xs) - Math.min(...xs) + 1;
        this.height = Math.max(...ys) - Math.min(...ys) + 1;
    }

    getAbsolutePoints(): Point[] {
        const gridY = Math.floor(this.y);
        return this.points.map(p => ({ x: this.x + p.x, y: gridY + p.y }));
    }

    moveDown(speed: number) {
        this.y += speed;
    }

    // Returns true if the block was added successfully (not colliding with self)
    addBlock(relX: number, relY: number): boolean {
        // Check if point already exists
        if (this.points.some(p => p.x === relX && p.y === relY)) {
            return false;
        }
        this.points.push({ x: relX, y: relY });
        this.recalcBounds();
        return true;
    }

    isPerfectRectangle(): boolean {
        // Determine bounds of current points
        if (this.points.length === 0) return false;

        // Normalize points to 0,0 based on minX, minY
        // Because points are relative to shape origin (x,y), but shape origin might not be the top-left of the actual blocks if we added some.
        // Actually, we should keep points normalized?
        // Let's find bounds.
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of this.points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        const w = maxX - minX + 1;
        const h = maxY - minY + 1;

        // Check if we have w * h points
        return this.points.length === w * h;
    }
}

export const SHAPES_DATA = [
    // simple block
    [{ x: 0, y: 0 }],
    // L shape
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    // T shape
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
    // 2x2
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    // Line
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
    // U shape
    [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    // S shape
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    // Z shape
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
];

export function createRandomShape(idOffset: number = 0): Shape {
    const points = [...SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)]].map(p => ({ ...p }));
    const width = Math.max(...points.map(p => p.x)) + 1;
    const xStart = Math.floor(Math.random() * (GRID_WIDTH - width));
    // Initial Y is -height to spawn above
    const height = Math.max(...points.map(p => p.y)) + 1;
    return new Shape(xStart, -height, points);
}
