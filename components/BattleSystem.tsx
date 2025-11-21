
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Enemy, PlayerStats, Bullet } from '../types';
import { Typewriter } from './Typewriter';

interface BattleSystemProps {
  enemy: Enemy;
  playerStats: PlayerStats;
  onBattleEnd: (win: boolean, spared: boolean) => void;
  setPlayerStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
}

type TurnState = 'PLAYER_MENU' | 'PLAYER_ACT_MENU' | 'DIALOGUE' | 'ENEMY_TURN_ACTIVE' | 'VICTORY';

const CANVAS_SIZE = 300;
const PLAYER_SIZE = 16; // Heart size
const PLAYER_HITBOX = 4; // Smaller hitbox for fairness
const PLAYER_SPEED = 160; // Pixels per second

export const BattleSystem: React.FC<BattleSystemProps> = ({ enemy, playerStats, onBattleEnd, setPlayerStats }) => {
  const [turnState, setTurnState] = useState<TurnState>('PLAYER_MENU');
  const [dialogueText, setDialogueText] = useState<string>(`${enemy.name} sana dik dik bakıyor.`);
  const [spareReady, setSpareReady] = useState(false);
  const [shake, setShake] = useState(false);
  
  // Canvas & Game Loop Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const turnTimerRef = useRef<number>(0);

  // Game State Refs (Mutable for performance)
  const gameState = useRef({
      playerX: CANVAS_SIZE / 2,
      playerY: CANVAS_SIZE / 2,
      bullets: [] as Bullet[],
      keys: {} as Record<string, boolean>,
      isInvulnerable: false
  });

  // --- INPUT HANDLING ---
  useEffect(() => {
    const down = (e: KeyboardEvent) => { gameState.current.keys[e.code] = true; };
    const up = (e: KeyboardEvent) => { gameState.current.keys[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
        window.removeEventListener('keydown', down);
        window.removeEventListener('keyup', up);
    };
  }, []);

  // --- HELPER: START ENEMY TURN ---
  const startEnemyTurn = useCallback(() => {
    setTurnState('ENEMY_TURN_ACTIVE');
    gameState.current.bullets = [];
    gameState.current.playerX = CANVAS_SIZE / 2;
    gameState.current.playerY = CANVAS_SIZE / 2;
    gameState.current.isInvulnerable = false;
    turnTimerRef.current = Date.now();
    lastTimeRef.current = Date.now();
  }, []);

  // --- GAME LOOP (CANVAS) ---
  const update = useCallback((time: number) => {
      if (turnState !== 'ENEMY_TURN_ACTIVE' || !canvasRef.current) return;

      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // 1. Logic Update
      
      // Timer Check
      const duration = 6000; // 6 seconds
      if (Date.now() - turnTimerRef.current > duration) {
          setTurnState('PLAYER_MENU');
          setDialogueText("Sıra sende!");
          return;
      }

      // Player Movement
      const speed = PLAYER_SPEED * deltaTime;
      const keys = gameState.current.keys;
      let dx = 0; 
      let dy = 0;

      if (keys['ArrowUp'] || keys['KeyW']) dy -= speed;
      if (keys['ArrowDown'] || keys['KeyS']) dy += speed;
      if (keys['ArrowLeft'] || keys['KeyA']) dx -= speed;
      if (keys['ArrowRight'] || keys['KeyD']) dx += speed;

      gameState.current.playerX = Math.max(PLAYER_SIZE/2, Math.min(CANVAS_SIZE - PLAYER_SIZE/2, gameState.current.playerX + dx));
      gameState.current.playerY = Math.max(PLAYER_SIZE/2, Math.min(CANVAS_SIZE - PLAYER_SIZE/2, gameState.current.playerY + dy));

      // Spawn Bullets
      if (Math.random() < 0.1) { // Spawn chance per frame
          const side = Math.floor(Math.random() * 4);
          let bx = 0, by = 0, bvx = 0, bvy = 0;
          const bSpeed = 100 * deltaTime; // Scaled by delta but base logic needs vector

          // Random edge spawn
          if (side === 0) { bx = Math.random() * CANVAS_SIZE; by = -10; bvy = 2; bvx = (Math.random() - 0.5) * 2; }
          if (side === 1) { bx = Math.random() * CANVAS_SIZE; by = CANVAS_SIZE + 10; bvy = -2; bvx = (Math.random() - 0.5) * 2; }
          if (side === 2) { bx = -10; by = Math.random() * CANVAS_SIZE; bvx = 2; bvy = (Math.random() - 0.5) * 2; }
          if (side === 3) { bx = CANVAS_SIZE + 10; by = Math.random() * CANVAS_SIZE; bvx = -2; bvy = (Math.random() - 0.5) * 2; }

          // Targeted pattern overrides
          if (enemy.bulletPattern === 'CHASING') {
              const angle = Math.atan2(gameState.current.playerY - by, gameState.current.playerX - bx);
              bvx = Math.cos(angle) * 2.5;
              bvy = Math.sin(angle) * 2.5;
          }

          gameState.current.bullets.push({
              id: Math.random(),
              x: bx,
              y: by,
              vx: bvx,
              vy: bvy,
              width: 10,
              height: 10,
              color: 'white'
          });
      }

      // Update Bullets & Collision
      for (let i = gameState.current.bullets.length - 1; i >= 0; i--) {
          const b = gameState.current.bullets[i];
          b.x += b.vx * (60 * deltaTime); // Normalize speed
          b.y += b.vy * (60 * deltaTime);

          // Remove off-screen
          if (b.x < -20 || b.x > CANVAS_SIZE + 20 || b.y < -20 || b.y > CANVAS_SIZE + 20) {
              gameState.current.bullets.splice(i, 1);
              continue;
          }

          // Collision
          if (!gameState.current.isInvulnerable) {
              const dist = Math.sqrt(Math.pow(b.x - gameState.current.playerX, 2) + Math.pow(b.y - gameState.current.playerY, 2));
              if (dist < (b.width/2 + PLAYER_HITBOX)) {
                  // HIT!
                  setShake(true);
                  setTimeout(() => setShake(false), 500);
                  gameState.current.bullets = []; // Clear screen mercy
                  setPlayerStats(prev => {
                      const hp = Math.max(0, prev.hp - enemy.atk);
                      if (hp <= 0) setTimeout(() => onBattleEnd(false, false), 100);
                      return { ...prev, hp };
                  });
                  gameState.current.isInvulnerable = true;
                  setTimeout(() => gameState.current.isInvulnerable = false, 1000);
                  break;
              }
          }
      }

      // 2. Render
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw Bullets
      ctx.fillStyle = 'white';
      for (const b of gameState.current.bullets) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.width/2, 0, Math.PI * 2);
          ctx.fill();
      }

      // Draw Player (Heart)
      ctx.fillStyle = gameState.current.isInvulnerable ? 'gray' : 'red';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❤️', gameState.current.playerX, gameState.current.playerY);
      
      // Debug Hitbox
      // ctx.strokeStyle = 'yellow';
      // ctx.strokeRect(gameState.current.playerX - PLAYER_HITBOX, gameState.current.playerY - PLAYER_HITBOX, PLAYER_HITBOX*2, PLAYER_HITBOX*2);

      // Border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      requestRef.current = requestAnimationFrame(update);
  }, [turnState, enemy, onBattleEnd, setPlayerStats]);

  useEffect(() => {
      if (turnState === 'ENEMY_TURN_ACTIVE') {
          lastTimeRef.current = Date.now();
          requestRef.current = requestAnimationFrame(update);
      }
      return () => cancelAnimationFrame(requestRef.current);
  }, [turnState, update]);


  // --- PLAYER ACTIONS ---

  const handleAttack = () => {
    const dmg = 15 + Math.floor(Math.random() * 10);
    enemy.hp -= dmg;
    setDialogueText(`Şaaak! ${dmg} hasar verdin.`);
    setTurnState('DIALOGUE');
    
    if (enemy.hp <= 0) {
        setTimeout(() => onBattleEnd(true, false), 1500);
    }
  };

  const handleAct = (actIndex: number) => {
    const act = enemy.acts[actIndex];
    setDialogueText(act.response);
    if (act.effect === 'SPARE_READY') setSpareReady(true);
    setTurnState('DIALOGUE');
  };

  const handleSpare = () => {
    if (spareReady) {
        setDialogueText(`${enemy.name} ile helalleştiniz.`);
        setTimeout(() => onBattleEnd(true, true), 1500);
    } else {
        setDialogueText(`${enemy.name}: "Daha işimiz bitmedi koçum!"`);
        setTurnState('DIALOGUE');
    }
  };

  const nextTurn = () => {
    if (turnState === 'DIALOGUE') {
        if (enemy.hp <= 0) return;
        const randDiag = enemy.dialogues[Math.floor(Math.random() * enemy.dialogues.length)];
        setDialogueText(randDiag);
        setTimeout(startEnemyTurn, 1000);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto mt-8 p-4 font-mono text-white relative ${shake ? 'shake' : ''}`}>
      
      {/* Enemy Visual */}
      <div className="flex flex-col items-center mb-8">
        <div className={`w-32 h-32 ${enemy.spriteColor} mb-4 animate-bounce border-4 border-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]`}>
            <span className="text-6xl">👾</span>
        </div>
        <div className="w-64 bg-red-900 border-2 border-white h-6 relative">
            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${(Math.max(0, enemy.hp) / enemy.maxHp) * 100}%` }}></div>
        </div>
        <p className="mt-2 text-2xl font-bold uppercase tracking-widest">{enemy.name} {spareReady ? '(SARI)' : ''}</p>
      </div>

      {/* Battle Area */}
      <div className="flex justify-center mb-6">
          {turnState === 'ENEMY_TURN_ACTIVE' ? (
              <canvas 
                ref={canvasRef} 
                width={CANVAS_SIZE} 
                height={CANVAS_SIZE} 
                className="border-4 border-white bg-black cursor-none"
              />
          ) : (
              <div className="w-[500px] h-[180px] border-4 border-white bg-black p-6 text-2xl flex flex-col justify-between">
                   <div className="leading-relaxed"><Typewriter text={dialogueText} speed={20} /></div>
                   {turnState === 'DIALOGUE' && (
                       <div className="text-right text-yellow-400 animate-pulse cursor-pointer hover:text-white" onClick={nextTurn}>
                           [DEVAM ET Z/ENTER]
                       </div>
                   )}
              </div>
          )}
      </div>

      {/* Player Stats */}
      <div className="flex justify-between items-end mb-6 px-12 font-bold text-xl">
        <div>{playerStats.name} <span className="text-sm text-gray-400">LV {playerStats.lv}</span></div>
        <div className="flex items-center gap-4">
            <span className="text-red-500 text-sm">HP</span>
            <div className="w-32 h-5 bg-red-900 border border-white relative">
                <div className="bg-yellow-400 h-full absolute top-0 left-0 transition-all" style={{ width: `${(playerStats.hp / playerStats.maxHp) * 100}%`}}></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs z-10 drop-shadow-md">{Math.floor(playerStats.hp)} / {playerStats.maxHp}</div>
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      {turnState !== 'ENEMY_TURN_ACTIVE' && turnState !== 'DIALOGUE' && (
        <div className="grid grid-cols-2 gap-4 px-12">
           {turnState === 'PLAYER_MENU' && (
               <>
                <button onClick={handleAttack} className="battle-btn border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black py-4 text-2xl font-bold transition-colors">⚔️ SALDIR</button>
                <button onClick={() => setTurnState('PLAYER_ACT_MENU')} className="battle-btn border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black py-4 text-2xl font-bold transition-colors">🗣️ KONUŞ</button>
                <button className="battle-btn border-2 border-green-500 text-green-500 opacity-50 cursor-not-allowed py-4 text-2xl font-bold">🎒 EŞYA</button>
                <button onClick={handleSpare} className={`battle-btn border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black py-4 text-2xl font-bold transition-colors ${spareReady ? 'animate-pulse' : ''}`}>❤️ AF DİLE</button>
               </>
           )}
           {turnState === 'PLAYER_ACT_MENU' && (
               <div className="col-span-2 grid grid-cols-1 gap-3">
                   {enemy.acts.map((act, idx) => (
                       <button key={idx} onClick={() => handleAct(idx)} className="border-2 border-white p-3 hover:bg-white hover:text-black text-left text-xl transition-colors group">
                           <span className="text-yellow-500 group-hover:text-black">* {act.name}</span> <span className="text-gray-500 group-hover:text-gray-700 text-base ml-2">- {act.description}</span>
                       </button>
                   ))}
                   <button onClick={() => setTurnState('PLAYER_MENU')} className="border border-red-500 text-red-500 p-2 hover:bg-red-500 hover:text-black mt-2 w-1/3 mx-auto">GERİ</button>
               </div>
           )}
        </div>
      )}

      <style>{`
        .battle-btn { position: relative; }
        .battle-btn:hover::before {
            content: '❤️';
            position: absolute;
            left: 10px;
            animation: bounce 1s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};
