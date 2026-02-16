import { Block, GRID_HEIGHT, GRID_WIDTH, Point } from './types';

export class Grid {
    cells: Block[][];

    constructor() {
        this.cells = Array(GRID_HEIGHT).fill(null).map(() =>
            Array(GRID_WIDTH).fill({ type: 'empty' })
        );
    }

    isValid(x: number, y: number): boolean {
        return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
    }

    isEmpty(x: number, y: number): boolean {
        return this.isValid(x, y) && this.cells[y][x].type === 'empty';
    }

    setblock(x: number, y: number, block: Block) {
        if (this.isValid(x, y)) {
            this.cells[y][x] = block;
        }
    }

    // Check if placing a block at (x,y) completes a rectangle
    checkRectangleMatch(startPoint: Point): Point[] | null {
        // 1. Flood fill to find connected component
        const visited = new Set<string>();
        const component: Point[] = [];
        const queue: Point[] = [startPoint];

        visited.add(`${startPoint.x},${startPoint.y}`);

        while (queue.length > 0) {
            const p = queue.shift()!;
            component.push(p);

            const neighbors = [
                { x: p.x + 1, y: p.y },
                { x: p.x - 1, y: p.y },
                { x: p.x, y: p.y + 1 },
                { x: p.x, y: p.y - 1 }
            ];

            for (const n of neighbors) {
                if (this.isValid(n.x, n.y) && !this.isEmpty(n.x, n.y)) {
                    const key = `${n.x},${n.y}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push(n);
                    }
                }
            }
        }

        // 2. Check if component forms a rectangle
        if (component.length < 4) return null; // Quarth typically requires at least a square? Or just any rectangle?
        // Actually 1x1 is a rectangle but trivial. Let's assume > 1 or whatever the game rules are.
        // In Quarth you fill holes. A 2x2 is the smallest meaningful clear usually.
        // But if I fill a 1x2 hole to make a 2x2, that's valid.

        let minX = GRID_WIDTH, maxX = -1, minY = GRID_HEIGHT, maxY = -1;
        for (const p of component) {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        }

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        if (width * height === component.length) {
            // It's a perfect rectangle!
            return component;
        }

        return null;
    }

    clearBlocks(points: Point[]) {
        for (const p of points) {
            this.cells[p.y][p.x] = { type: 'empty' };
        }
    }
}
