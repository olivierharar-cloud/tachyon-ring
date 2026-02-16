import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';

type GameState = 'menu' | 'playing' | 'gameover';

interface GameStats {
    score: number;
    rectangles: number;
    maxCombo: number;
    accuracy: number;
}

function App() {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [lastStats, setLastStats] = useState<GameStats>({
        score: 0, rectangles: 0, maxCombo: 0, accuracy: 0
    });

    const startGame = () => setGameState('playing');

    const handleGameOver = (score: number, stats?: { rectangles: number; maxCombo: number; accuracy: number }) => {
        setLastStats({
            score,
            rectangles: stats?.rectangles ?? 0,
            maxCombo: stats?.maxCombo ?? 0,
            accuracy: stats?.accuracy ?? 0,
        });
        setGameState('gameover');
    };

    return (
        <div className="w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden relative">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>

            <div className="z-10 relative w-full h-full flex flex-col items-center justify-center">
                {gameState === 'menu' && <MainMenu onStart={startGame} />}

                {gameState === 'playing' && (
                    <GameCanvas onGameOver={handleGameOver} />
                )}

                {gameState === 'gameover' && (
                    <div className="flex flex-col items-center justify-center space-y-8 bg-slate-900/90 backdrop-blur-xl p-12 rounded-3xl border border-slate-700/50 shadow-2xl shadow-red-900/10 animate-in fade-in zoom-in duration-300 max-w-md w-full">
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 tracking-tight">
                            GAME OVER
                        </h2>

                        {/* Score */}
                        <div className="text-center">
                            <p className="text-sm text-slate-500 uppercase tracking-widest mb-1">Score Final</p>
                            <p className="text-5xl font-black text-white tabular-nums">
                                {lastStats.score.toLocaleString()}
                            </p>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-4 w-full">
                            <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-500 uppercase">Rectangles</p>
                                <p className="text-2xl font-bold text-amber-400">{lastStats.rectangles}</p>
                            </div>
                            <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-500 uppercase">Max Combo</p>
                                <p className="text-2xl font-bold text-purple-400">×{lastStats.maxCombo}</p>
                            </div>
                            <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-500 uppercase">Précision</p>
                                <p className="text-2xl font-bold text-cyan-400">{lastStats.accuracy}%</p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={startGame}
                                className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white font-bold text-lg hover:scale-[1.03] transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                🔄 Rejouer
                            </button>
                            <button
                                onClick={() => setGameState('menu')}
                                className="w-full px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all text-sm"
                            >
                                Retour au Menu
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
