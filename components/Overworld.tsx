
import React, { useState, useEffect, useRef } from 'react';
import { LocationId, PlayerStats, Position } from '../types';
import { MAPS } from '../constants';

interface OverworldProps {
  currentLocation: LocationId;
  playerPos: Position;
  onPlayerMove: (pos: Position) => void;
  onChangeLocation: (loc: LocationId, x: number, y: number) => void;
  onTalk: (npcId: string) => void;
  playerStats: PlayerStats;
  flags: Record<string, boolean>;
  isPaused: boolean;
}

const TILE_SIZE = 40;
const PLAYER_SPEED = 5; // Speed per frame
// Hitbox reduced to allow smoother movement through 40px gaps
const HITBOX_SIZE = 24; 
const HITBOX_OFFSET = (TILE_SIZE - HITBOX_SIZE) / 2; // Centers the hitbox (8px offset)

export const Overworld: React.FC<OverworldProps> = ({ 
    currentLocation, 
    playerPos, 
    onPlayerMove, 
    onChangeLocation, 
    onTalk, 
    playerStats, 
    flags,
    isPaused 
}) => {
  const mapData = MAPS[currentLocation];
  const [facing, setFacing] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('DOWN');
  
  // Refs for loop
  const keysPressed = useRef<Record<string, boolean>>({});
  const requestRef = useRef<number>(0);

  // Input Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
        if (!isPaused) keysPressed.current[e.code] = true; 
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
        keysPressed.current[e.code] = false; 
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused]);

  // Reset keys when paused to prevent "running in place"
  useEffect(() => {
      if (isPaused) {
          keysPressed.current = {};
      }
  }, [isPaused]);

  // Collision Helper
  const checkCollision = (x: number, y: number) => {
      // Box vs Grid Tile collision
      const corners = [
          { x: x + HITBOX_OFFSET, y: y + HITBOX_OFFSET }, // Top Left
          { x: x + HITBOX_OFFSET + HITBOX_SIZE, y: y + HITBOX_OFFSET }, // Top Right
          { x: x + HITBOX_OFFSET, y: y + HITBOX_OFFSET + HITBOX_SIZE }, // Bottom Left
          { x: x + HITBOX_OFFSET + HITBOX_SIZE, y: y + HITBOX_OFFSET + HITBOX_SIZE } // Bottom Right
      ];

      for (const c of corners) {
          const tx = Math.floor(c.x / TILE_SIZE);
          const ty = Math.floor(c.y / TILE_SIZE);

          // Out of bounds
          if (tx < 0 || tx >= mapData.width || ty < 0 || ty >= mapData.height) return true;
          
          // Wall
          if (mapData.layout[ty][tx] === 1) return true;
      }
      return false;
  };

  // Game Loop
  const update = () => {
    if (isPaused) return;

    let dx = 0;
    let dy = 0;

    if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) { dy = -PLAYER_SPEED; setFacing('UP'); }
    if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) { dy = PLAYER_SPEED; setFacing('DOWN'); }
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) { dx = -PLAYER_SPEED; setFacing('LEFT'); }
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) { dx = PLAYER_SPEED; setFacing('RIGHT'); }

    if (dx !== 0 || dy !== 0) {
        // Normalize diagonal speed
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        let nextX = playerPos.x + dx;
        let nextY = playerPos.y + dy;

        // Independent Axis Collision (Sliding)
        // Check X movement first
        if (checkCollision(nextX, playerPos.y)) {
            nextX = playerPos.x; // Block X movement
        }
        
        // Check Y movement with potentially updated X
        // This allows sliding along a wall because if X is blocked, we still check Y from the original/blocked X
        if (checkCollision(nextX, nextY)) {
            nextY = playerPos.y; // Block Y movement
        }

        // Check Doors
        const cx = nextX + TILE_SIZE / 2;
        const cy = nextY + TILE_SIZE / 2;
        const tx = Math.floor(cx / TILE_SIZE);
        const ty = Math.floor(cy / TILE_SIZE);
        
        const door = mapData.doors.find(d => d.x === tx && d.y === ty);
        if (door) {
            onChangeLocation(door.target, door.targetX, door.targetY);
            return; // Stop update for this frame
        }

        // Update position if changed
        if (nextX !== playerPos.x || nextY !== playerPos.y) {
            onPlayerMove({ x: nextX, y: nextY });
        }
    }

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
      requestRef.current = requestAnimationFrame(update);
      return () => cancelAnimationFrame(requestRef.current);
  }); // Runs on every render, which is fine since update loop is rAF

  // Interaction
  useEffect(() => {
      const handleInteract = (e: KeyboardEvent) => {
          if (isPaused) return;
          if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE' || e.code === 'KeyZ') {
              // Determine target tile based on facing
              let tx = playerPos.x + TILE_SIZE/2;
              let ty = playerPos.y + TILE_SIZE/2;

              if (facing === 'UP') ty -= TILE_SIZE;
              if (facing === 'DOWN') ty += TILE_SIZE;
              if (facing === 'LEFT') tx -= TILE_SIZE;
              if (facing === 'RIGHT') tx += TILE_SIZE;

              // Check distance to all NPCs
              const npc = mapData.npcs.find(n => {
                  // If NPC is defeated, don't interact if we want them gone
                  if (flags[n.id + '_DEFEATED'] && n.id !== 'WALTEY_INTRO') return false;

                  const ncx = n.x * TILE_SIZE + TILE_SIZE/2;
                  const ncy = n.y * TILE_SIZE + TILE_SIZE/2;
                  const dist = Math.sqrt(Math.pow(tx - ncx, 2) + Math.pow(ty - ncy, 2));
                  // Check if within 1.5 tiles
                  return dist < TILE_SIZE * 1.5;
              });

              if (npc) {
                  onTalk(npc.id);
              }
          }
      };
      window.addEventListener('keydown', handleInteract);
      return () => window.removeEventListener('keydown', handleInteract);
  }, [playerPos, mapData, onTalk, facing, isPaused, flags]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="relative border-4 border-white shadow-2xl bg-black transition-all" 
             style={{ 
                 width: mapData.width * TILE_SIZE, 
                 height: mapData.height * TILE_SIZE,
                 // Optional: Scale up for retro feel
                 transform: 'scale(1.5)',
                 transformOrigin: 'center'
             }}>
            
            {/* Grid */}
            {mapData.layout.map((row, y) => (
                row.map((cell, x) => {
                    // Optimization: Only render visible or non-empty tiles if map is huge, but for 15x15 its ok
                    let bgClass = '';
                    if (cell === 1) bgClass = 'bg-gray-800 border border-gray-700'; // Wall
                    if (cell === 0) bgClass = 'bg-gray-900'; // Floor
                    
                    return (
                        <div 
                            key={`${x}-${y}`} 
                            className={`absolute ${bgClass}`}
                            style={{ left: x * TILE_SIZE, top: y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
                        />
                    );
                })
            ))}

            {/* Doors */}
            {mapData.doors.map((d, i) => (
                <div key={i} className="absolute bg-gray-800/50 flex items-center justify-center text-xs"
                    style={{ left: d.x * TILE_SIZE, top: d.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                    🚪
                </div>
            ))}

            {/* NPCs */}
            {mapData.npcs.map(npc => {
                if (flags[npc.id + '_DEFEATED'] && npc.id !== 'WALTEY_INTRO') return null; // Hide defeated
                return (
                    <div key={npc.id} className="absolute flex items-center justify-center text-2xl z-10 animate-pulse"
                        style={{ left: npc.x * TILE_SIZE, top: npc.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                        {npc.sprite}
                    </div>
                );
            })}

            {/* Player */}
            <div 
                className="absolute z-20 flex flex-col items-center justify-center transition-all duration-75"
                style={{ 
                    left: playerPos.x, 
                    top: playerPos.y, 
                    width: TILE_SIZE, 
                    height: TILE_SIZE,
                }}
            >
                {/* Sprite */}
                <div className={`w-8 h-8 bg-red-600 border-2 border-white ${isPaused ? '' : 'animate-bounce-slight'}`}>
                    {/* Eyes based on facing */}
                    <div className="relative w-full h-full">
                        {facing === 'RIGHT' && <div className="absolute top-2 right-1 w-1 h-1 bg-white"></div>}
                        {facing === 'LEFT' && <div className="absolute top-2 left-1 w-1 h-1 bg-white"></div>}
                        {(facing === 'DOWN' || facing === 'UP') && <div className="flex justify-center gap-1 mt-2"><div className="w-1 h-1 bg-white"></div><div className="w-1 h-1 bg-white"></div></div>}
                    </div>
                </div>
                {/* Name Tag */}
                <div className="absolute -top-5 text-[8px] bg-black px-1 border border-white text-white whitespace-nowrap">
                    Ahmet LV{playerStats.lv}
                </div>
                
                {/* Debug Hitbox (Optional) */}
                {/* <div className="absolute border border-green-500 opacity-50 pointer-events-none"
                     style={{ 
                         width: HITBOX_SIZE, 
                         height: HITBOX_SIZE, 
                         left: HITBOX_OFFSET, 
                         top: HITBOX_OFFSET 
                     }} 
                /> */}
            </div>
        </div>
        
        <style>{`
            @keyframes bounce-slight {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-2px); }
            }
            .animate-bounce-slight {
                animation: bounce-slight 0.3s infinite;
            }
        `}</style>
    </div>
  );
};