import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import {
    GRID_WIDTH, GRID_HEIGHT, BLOCK_SIZE,
    Particle, PowerUpType,
    POWER_UP_COLORS, POWER_UP_ICONS,
} from '../engine/types';
import { Player } from '../engine/Player';

interface GameCanvasProps {
    onGameOver: (score: number, stats?: { rectangles: number; maxCombo: number; accuracy: number }) => void;
}

// ──────────────────────────────────
// Ship drawing helper
// ──────────────────────────────────

// ──────────────────────────────────
// Player Themes (4-Player Support)
// ──────────────────────────────────

const PLAYER_THEMES = [
    // P1: Red
    {
        primary: '#dc2626', light: '#fca5a5', dark: '#7f1d1d',
        glow: 'rgba(239,68,68,', flame: '#ef4444', engine: '#fbbf24',
        canopy: { mid: '#fecaca', dark: '#991b1b' }
    },
    // P2: Blue
    {
        primary: '#2563eb', light: '#93c5fd', dark: '#1e3a5f',
        glow: 'rgba(59,130,246,', flame: '#3b82f6', engine: '#93c5fd',
        canopy: { mid: '#bfdbfe', dark: '#1e40af' }
    },
    // P3: Green
    {
        primary: '#16a34a', light: '#86efac', dark: '#14532d',
        glow: 'rgba(34,197,94,', flame: '#22c55e', engine: '#86efac',
        canopy: { mid: '#bbf7d0', dark: '#166534' }
    },
    // P4: Yellow
    {
        primary: '#ca8a04', light: '#fde047', dark: '#713f12',
        glow: 'rgba(234,179,8,', flame: '#eab308', engine: '#fef08a',
        canopy: { mid: '#fef9c3', dark: '#854d0e' }
    }
];

function drawShip(ctx: CanvasRenderingContext2D, player: Player, gridBottomY: number) {
    const BS = BLOCK_SIZE;
    const cx = player.x * BS + BS / 2;
    const baseY = gridBottomY; // top of ship row
    const recoilOffset = player.recoil * 4; // push down on shoot

    // Get theme based on ID (1-based index -> 0-based array)
    const themeIndex = (player.id - 1) % PLAYER_THEMES.length;
    const theme = PLAYER_THEMES[themeIndex];

    ctx.save();
    ctx.translate(cx, baseY + BS / 2 + recoilOffset);

    // Thruster glow
    const thrustIntensity = 0.5 + 0.3 * Math.sin(player.thrustPhase);
    const thrustGrad = ctx.createRadialGradient(0, BS * 0.3, 0, 0, BS * 0.6, BS * 0.5);
    thrustGrad.addColorStop(0, `${theme.glow}${thrustIntensity})`);
    thrustGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = thrustGrad;
    ctx.fillRect(-BS * 0.4, BS * 0.1, BS * 0.8, BS * 0.5);

    // Thruster flame flicker
    const flameH = 6 + 4 * Math.sin(player.thrustPhase * 3);
    const flameGrad = ctx.createLinearGradient(0, BS * 0.15, 0, BS * 0.15 + flameH);
    flameGrad.addColorStop(0, theme.engine);
    flameGrad.addColorStop(0.6, theme.flame);
    flameGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-3, BS * 0.15);
    ctx.lineTo(3, BS * 0.15);
    ctx.lineTo(0, BS * 0.15 + flameH);
    ctx.closePath();
    ctx.fill();

    // Body glow halo
    const glowAlpha = 0.15 + 0.1 * Math.sin(player.glowPhase);
    const haloGrad = ctx.createRadialGradient(0, -2, BS * 0.15, 0, -2, BS * 0.6);
    haloGrad.addColorStop(0, `${theme.glow}${glowAlpha})`);
    haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(-BS * 0.6, -BS * 0.6, BS * 1.2, BS * 1.2);

    // Main body — sleek hexagonal ship
    // Ship hull
    ctx.beginPath();
    ctx.moveTo(0, -BS * 0.42);           // nose
    ctx.lineTo(BS * 0.18, -BS * 0.2);    // right upper
    ctx.lineTo(BS * 0.35, BS * 0.05);    // right wing start
    ctx.lineTo(BS * 0.42, BS * 0.15);    // right wing tip
    ctx.lineTo(BS * 0.22, BS * 0.15);    // right wing inner
    ctx.lineTo(BS * 0.16, BS * 0.22);    // right rear
    ctx.lineTo(-BS * 0.16, BS * 0.22);   // left rear
    ctx.lineTo(-BS * 0.22, BS * 0.15);   // left wing inner
    ctx.lineTo(-BS * 0.42, BS * 0.15);   // left wing tip
    ctx.lineTo(-BS * 0.35, BS * 0.05);   // left wing start
    ctx.lineTo(-BS * 0.18, -BS * 0.2);   // left upper
    ctx.closePath();

    // Body gradient
    const grad = ctx.createLinearGradient(0, -BS * 0.4, 0, BS * 0.2);
    grad.addColorStop(0, theme.light);
    grad.addColorStop(0.4, theme.primary);
    grad.addColorStop(1, theme.dark);
    ctx.fillStyle = grad;
    ctx.fill();

    // Hull outline
    ctx.strokeStyle = theme.light;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Cockpit canopy
    const canopyGrad = ctx.createLinearGradient(0, -BS * 0.3, 0, -BS * 0.05);
    canopyGrad.addColorStop(0, '#e0f2fe');
    canopyGrad.addColorStop(0.5, theme.canopy.mid);
    canopyGrad.addColorStop(1, theme.canopy.dark);
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.moveTo(0, -BS * 0.32);
    ctx.lineTo(BS * 0.08, -BS * 0.12);
    ctx.lineTo(0, -BS * 0.05);
    ctx.lineTo(-BS * 0.08, -BS * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Wing accent lines
    ctx.strokeStyle = theme.light;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(BS * 0.18, -BS * 0.18);
    ctx.lineTo(BS * 0.35, BS * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-BS * 0.18, -BS * 0.18);
    ctx.lineTo(-BS * 0.35, BS * 0.05);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Small engine dots
    const dotGlow = 0.6 + 0.4 * Math.sin(player.thrustPhase * 2);
    ctx.fillStyle = `rgba(255,255,255,${dotGlow})`; // Generic bright engine center
    ctx.beginPath();
    ctx.arc(-BS * 0.08, BS * 0.18, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(BS * 0.08, BS * 0.18, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ──────────────────────────────────
// Particle drawing helper
// ──────────────────────────────────

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    const px = p.x * BLOCK_SIZE;
    const py = p.y * BLOCK_SIZE;

    switch (p.type) {
        case 'spark': {
            ctx.fillStyle = p.color;
            ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
            break;
        }
        case 'glow': {
            const grad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(px - p.size * 2, py - p.size * 2, p.size * 4, p.size * 4);
            break;
        }
        case 'star': {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            const spikes = 4;
            const outerR = p.size;
            const innerR = p.size * 0.4;
            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const angle = (Math.PI * i) / spikes - Math.PI / 2;
                const sx = px + Math.cos(angle) * r;
                const sy = py + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.closePath();
            ctx.fill();
            break;
        }
        case 'ring': {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.stroke();
            break;
        }
    }
    ctx.restore();
}

// ──────────────────────────────────
// HUD drawing helpers
// ──────────────────────────────────

function drawHUD(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    canvasW: number,
) {
    const BS = BLOCK_SIZE;
    const gridH = GRID_HEIGHT * BS;

    // ── Score ──
    ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${engine.score.toLocaleString()}`, 12, 28);

    // ── Difficulty badge ──
    const diff = engine.currentDifficulty;
    ctx.font = 'bold 13px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = diff.color;
    const badgeText = `◈ ${diff.name.toUpperCase()}`;
    const badgeW = ctx.measureText(badgeText).width + 18;
    const badgeX = canvasW - badgeW - 8;
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = diff.color;
    roundRect(ctx, badgeX, 8, badgeW, 24, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = diff.color;
    ctx.textAlign = 'right';
    ctx.fillText(badgeText, canvasW - 14, 26);

    // ── Progress bar within difficulty ──
    const barY = 38;
    const barW = canvasW - 24;
    const barH = 3;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, 12, barY, barW, barH, 1.5);
    ctx.fill();
    const progress = engine['getProgressInLevel']();
    ctx.fillStyle = diff.color;
    roundRect(ctx, 12, barY, barW * progress, barH, 1.5);
    ctx.fill();

    // ── Combo indicator ──
    if (engine.combo.displayTimer > 0 && engine.combo.count > 0) {
        const comboAlpha = Math.min(1, engine.combo.displayTimer / 30);
        const scale = 1 + (engine.combo.count - 1) * 0.12;
        ctx.save();
        ctx.globalAlpha = comboAlpha;
        ctx.font = `bold ${Math.floor(28 * scale)}px "Inter", sans-serif`;
        ctx.textAlign = 'center';

        // Rainbow combo text for ×4+
        if (engine.combo.count >= 4) {
            const hue = (engine.frameCount * 6) % 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 65%)`;
        } else {
            ctx.fillStyle = '#fbbf24';
        }

        const comboText = `COMBO ×${engine.combo.multiplier}`;
        ctx.fillText(comboText, canvasW / 2, gridH / 2 - 20);

        if (engine.combo.count >= 3) {
            ctx.font = 'bold 16px "Inter", sans-serif';
            ctx.fillStyle = '#fef3c7';
            ctx.fillText(engine.combo.count >= 5 ? '⭐ PARFAIT!' : '🔥 INCROYABLE!', canvasW / 2, gridH / 2 + 10);
        }
        ctx.restore();
    }

    // ── Wave indicator ──
    if (engine.wave.timer > 0 && engine.difficultyIndex >= 2) {
        ctx.font = '11px "Inter", sans-serif';
        ctx.textAlign = 'left';
        if (engine.wave.active) {
            const pulse = 0.6 + 0.4 * Math.sin(engine.frameCount * 0.15);
            ctx.fillStyle = `rgba(239,68,68,${pulse})`;
            ctx.fillText('⚠ VAGUE INTENSE', 12, gridH - 8);
        } else {
            ctx.fillStyle = 'rgba(52,211,153,0.7)';
            ctx.fillText('☁ Accalmie', 12, gridH - 8);
        }
    }

    // ── Active power-ups indicators ──
    if (engine.activePowerUps.length > 0) {
        let puY = 56;
        for (const apu of engine.activePowerUps) {
            const pct = apu.remaining / 300;
            const color = POWER_UP_COLORS[apu.type];
            const icon = POWER_UP_ICONS[apu.type];
            const pLabel = apu.owner === 1 ? 'P1' : 'P2';

            // Background bar
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            roundRect(ctx, 10, puY, 110, 16, 4);
            ctx.fill();
            // Fill bar
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.6;
            roundRect(ctx, 10, puY, 110 * pct, 16, 4);
            ctx.fill();
            ctx.globalAlpha = 1;
            // Label
            ctx.font = '11px "Inter", sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText(`${icon} ${pLabel}`, 14, puY + 12);

            puY += 22;
        }
    }
}

/** Helper to draw rounded rectangles */
function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: number,
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ──────────────────────────────────
// Shape color palette
// ──────────────────────────────────

const SHAPE_COLORS = [
    { fill: '#fbbf24', stroke: '#d97706', glow: 'rgba(251,191,36,0.3)' },
    { fill: '#34d399', stroke: '#059669', glow: 'rgba(52,211,153,0.3)' },
    { fill: '#f472b6', stroke: '#db2777', glow: 'rgba(244,114,182,0.3)' },
    { fill: '#a78bfa', stroke: '#7c3aed', glow: 'rgba(167,139,250,0.3)' },
    { fill: '#fb923c', stroke: '#ea580c', glow: 'rgba(251,146,60,0.3)' },
    { fill: '#38bdf8', stroke: '#0284c7', glow: 'rgba(56,189,248,0.3)' },
];

function getShapeColor(id: number) {
    return SHAPE_COLORS[Math.abs(Math.floor(id * 1000)) % SHAPE_COLORS.length];
}

// ══════════════════════════════════
// COMPONENT
// ══════════════════════════════════

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GameEngine>(new GameEngine());
    const requestRef = useRef<number>();
    const [score, setScore] = useState(0);
    const [diffName, setDiffName] = useState('');

    useEffect(() => {
        const engine = engineRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        if (!ctx) return;

        const CANVAS_W = GRID_WIDTH * BLOCK_SIZE;
        const CANVAS_H = (GRID_HEIGHT + 1) * BLOCK_SIZE; // +1 row for ships

        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;

        const render = () => {
            const BS = BLOCK_SIZE;

            // ── Background ──
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            // Subtle grid
            ctx.strokeStyle = 'rgba(71,85,105,0.25)';
            ctx.lineWidth = 0.5;
            for (let x = 0; x <= GRID_WIDTH; x++) {
                ctx.beginPath();
                ctx.moveTo(x * BS, 0);
                ctx.lineTo(x * BS, GRID_HEIGHT * BS);
                ctx.stroke();
            }
            for (let y = 0; y <= GRID_HEIGHT; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * BS);
                ctx.lineTo(GRID_WIDTH * BS, y * BS);
                ctx.stroke();
            }

            // Danger zone glow near bottom
            const dangerShapes = engine.shapes.filter(s => {
                const maxY = Math.max(...s.getAbsolutePoints().map(p => p.y));
                return maxY >= GRID_HEIGHT - 4;
            });
            if (dangerShapes.length > 0) {
                const pulse = 0.08 + 0.06 * Math.sin(engine.frameCount * 0.12);
                const dangerGrad = ctx.createLinearGradient(0, (GRID_HEIGHT - 4) * BS, 0, GRID_HEIGHT * BS);
                dangerGrad.addColorStop(0, 'rgba(0,0,0,0)');
                dangerGrad.addColorStop(1, `rgba(239,68,68,${pulse})`);
                ctx.fillStyle = dangerGrad;
                ctx.fillRect(0, (GRID_HEIGHT - 4) * BS, CANVAS_W, 4 * BS);
            }

            // ── Draw shapes with colored fills ──
            engine.shapes.forEach(shape => {
                const colorSet = getShapeColor(shape.id);
                const pts = shape.getAbsolutePoints();

                // Glow behind shape
                ctx.fillStyle = colorSet.glow;
                pts.forEach(p => {
                    ctx.fillRect(p.x * BS - 2, p.y * BS - 2, BS + 4, BS + 4);
                });

                pts.forEach(p => {
                    // Fill
                    const blockGrad = ctx.createLinearGradient(
                        p.x * BS, p.y * BS,
                        p.x * BS, p.y * BS + BS,
                    );
                    blockGrad.addColorStop(0, colorSet.fill);
                    blockGrad.addColorStop(1, colorSet.stroke);
                    ctx.fillStyle = blockGrad;
                    ctx.fillRect(p.x * BS + 1, p.y * BS + 1, BS - 2, BS - 2);

                    // Inner highlight
                    ctx.fillStyle = 'rgba(255,255,255,0.18)';
                    ctx.fillRect(p.x * BS + 2, p.y * BS + 2, BS - 4, (BS - 4) / 2);

                    // Outline
                    ctx.strokeStyle = colorSet.stroke;
                    ctx.lineWidth = 1.4;
                    ctx.strokeRect(p.x * BS + 1, p.y * BS + 1, BS - 2, BS - 2);
                });
            });

            // ── Draw falling power-ups ──
            engine.fallingPowerUps.forEach(pu => {
                const puColor = POWER_UP_COLORS[pu.type];
                const puIcon = POWER_UP_ICONS[pu.type];
                const px = pu.x * BS + BS / 2;
                const py = pu.y * BS + BS / 2;
                const bob = Math.sin(engine.frameCount * 0.08) * 3;

                // Glow
                const puGlow = ctx.createRadialGradient(px, py + bob, 0, px, py + bob, BS * 0.7);
                puGlow.addColorStop(0, puColor);
                puGlow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = puGlow;
                ctx.fillRect(px - BS, py + bob - BS, BS * 2, BS * 2);
                ctx.globalAlpha = 1;

                // Diamond shape
                ctx.fillStyle = puColor;
                ctx.beginPath();
                ctx.moveTo(px, py + bob - BS * 0.35);
                ctx.lineTo(px + BS * 0.3, py + bob);
                ctx.lineTo(px, py + bob + BS * 0.35);
                ctx.lineTo(px - BS * 0.3, py + bob);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Icon
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#fff';
                ctx.fillText(puIcon, px, py + bob + 5);
            });

            // ── Draw bullets ──
            engine.bullets.forEach(b => {
                const bColor = b.owner === 1 ? '#ef4444' : '#3b82f6';
                const bGlow = b.owner === 1 ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)';
                const bx = b.x * BS + BS / 2;
                const by = b.y * BS + BS / 2;
                const bSize = BS * 0.28;

                // Trail
                const trailGrad = ctx.createLinearGradient(bx, by, bx, by + BS * 0.8);
                trailGrad.addColorStop(0, bGlow);
                trailGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = trailGrad;
                ctx.fillRect(bx - 2, by, 4, BS * 0.8);

                // Bullet glow
                const grad = ctx.createRadialGradient(bx, by, 0, bx, by, bSize * 2.5);
                grad.addColorStop(0, bColor);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(bx - bSize * 2.5, by - bSize * 2.5, bSize * 5, bSize * 5);

                // Core
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(bx, by, bSize * 0.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = bColor;
                ctx.beginPath();
                ctx.arc(bx, by, bSize, 0, Math.PI * 2);
                ctx.fill();
            });

            // ── Ship zone separator ──
            const shipY = GRID_HEIGHT * BS;
            ctx.fillStyle = 'rgba(30,41,59,0.9)';
            ctx.fillRect(0, shipY, CANVAS_W, BS);
            ctx.strokeStyle = 'rgba(148,163,184,0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, shipY);
            ctx.lineTo(CANVAS_W, shipY);
            ctx.stroke();

            // ── Draw ships ──
            engine.players.forEach(p => {
                drawShip(ctx, p, shipY);
            });

            // ── Draw particles ──
            engine.particles.forEach(p => drawParticle(ctx, p));

            // ── HUD overlay ──
            drawHUD(ctx, engine, CANVAS_W);

            setScore(engine.score);
            setDiffName(engine.currentDifficulty.name);
        };

        const loop = () => {
            engine.update();
            if (engine.gameOver) {
                const accuracy = engine.shotsTotal > 0
                    ? Math.round((engine.shotsHit / engine.shotsTotal) * 100)
                    : 0;
                onGameOver(engine.score, {
                    rectangles: engine.totalRectangles,
                    maxCombo: engine.maxCombo,
                    accuracy,
                });
                return;
            }
            render();
            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [onGameOver]);

    // ── Input handling ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const engine = engineRef.current;
            switch (e.code) {
                case 'KeyA': engine.movePlayer(1, -1); break;
                case 'KeyD': engine.movePlayer(1, 1); break;
                case 'Space':
                    e.preventDefault();
                    engine.playerShoot(1);
                    break;
                case 'ArrowLeft': engine.movePlayer(2, -1); break;
                case 'ArrowRight': engine.movePlayer(2, 1); break;
                case 'Enter':
                case 'ArrowUp':
                    e.preventDefault();
                    engine.playerShoot(2);
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={GRID_WIDTH * BLOCK_SIZE}
                height={(GRID_HEIGHT + 1) * BLOCK_SIZE}
                className="border-2 border-slate-700/50 bg-slate-950 shadow-2xl shadow-purple-900/20 rounded-xl"
            />
        </div>
    );
};
