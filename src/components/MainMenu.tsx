import React from 'react';
import { Gamepad2, Users } from 'lucide-react';

interface MainMenuProps {
    onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
    return (
        <div className="flex flex-col items-center space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="text-center space-y-4">
                <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 drop-shadow-2xl">
                    AGE OF ROCK
                </h1>
                <p className="text-xl text-slate-400 font-light tracking-widest uppercase">
                    Co-op Puzzle Shooter
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 w-full max-w-md">
                <button
                    onClick={onStart}
                    className="group relative flex items-center justify-center space-x-4 px-8 py-6 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700 rounded-2xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10"
                >
                    <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500 transition-colors">
                        <Users className="w-8 h-8 text-purple-400 group-hover:text-white" />
                    </div>
                    <div className="text-left">
                        <div className="text-2xl font-bold text-white">Start Game</div>
                        <div className="text-sm text-slate-400">Local Co-op Mode</div>
                    </div>

                    <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-500/0 group-hover:ring-purple-500/50 transition-all"></div>
                </button>

                <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400 text-sm space-y-2">
                    <p className="font-bold text-slate-300 mb-2">Controls:</p>
                    <div className="flex justify-between items-center">
                        <span className="text-red-400">Player 1</span>
                        <span>WASD + Space</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-400">Player 2</span>
                        <span>Arrows + Enter</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
