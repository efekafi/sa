
import React, { useState, useEffect, useRef } from 'react';
import { GamePhase, LocationId, PlayerStats, Enemy, Position } from './types';
import { INITIAL_PLAYER_STATS, ENEMIES, DIALOGUES, MAPS } from './constants';
import { BattleSystem } from './components/BattleSystem';
import { Overworld } from './components/Overworld';
import { Typewriter } from './components/Typewriter';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.INTRO);
  const [location, setLocation] = useState<LocationId>(LocationId.BEDROOM);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  
  // FIX: Initialize directly with the correct BEDROOM coordinates to avoid (0,0) wall glitch
  const [playerPos, setPlayerPos] = useState<Position>(() => {
    const startMap = MAPS[LocationId.BEDROOM];
    return { x: startMap.playerStart.x * 40, y: startMap.playerStart.y * 40 };
  });

  const [isInitialized, setIsInitialized] = useState(true); // Set to true immediately as we handled initial state

  // Dialogue State
  const [activeDialogueId, setActiveDialogueId] = useState<string | null>('INTRO');
  const [currentDialogueNodeId, setCurrentDialogueNodeId] = useState<string>('1');
  
  // Battle State
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  
  // Flags for story progression
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  // --- HANDLERS ---

  const handleNextDialogue = () => {
      if (!activeDialogueId) return;
      const nodes = DIALOGUES[activeDialogueId];
      const node = nodes.find(n => n.id === currentDialogueNodeId);

      if (node) {
          if (node.triggerBattle) {
              setPhase(GamePhase.BATTLE);
              const enemy = ENEMIES[node.triggerBattle];
              // Reset enemy HP for fresh battle or keep it? Let's reset for arcade feel
              setCurrentEnemy({ ...enemy, hp: enemy.maxHp }); 
              setActiveDialogueId(null);
              return;
          }

          if (node.next && node.next !== 'end') {
              // Safety check: Ensure next node exists
              const nextNode = nodes.find(n => n.id === node.next);
              if (nextNode) {
                  setCurrentDialogueNodeId(node.next);
              } else {
                  console.warn(`Dialogue node ${node.next} not found! Ending dialogue.`);
                  endDialogue();
              }
          } else {
              // End of conversation
              endDialogue();
          }
      }
  };

  const endDialogue = () => {
      setActiveDialogueId(null);
      if (phase === GamePhase.INTRO) {
          setPhase(GamePhase.OVERWORLD);
      } else if (phase === GamePhase.DIALOGUE) {
          setPhase(GamePhase.OVERWORLD);
      }
  };

  const handleLocationChange = (newLoc: LocationId, startTileX: number, startTileY: number) => {
      setLocation(newLoc);
      setPlayerPos({ x: startTileX * 40, y: startTileY * 40 });
  };

  const handlePlayerMove = (newPos: Position) => {
      setPlayerPos(newPos);
  };

  const handleTalkNPC = (npcId: string) => {
      // Don't talk if battle already defeated unique bosses unless generic
      if (flags[npcId + '_DEFEATED'] && npcId !== 'WALTEY_INTRO') {
         // Optional: Add generic "defeated" dialogue here
         return; 
      }
      
      if (DIALOGUES[npcId]) {
          setActiveDialogueId(npcId);
          const firstNode = DIALOGUES[npcId][0];
          setCurrentDialogueNodeId(firstNode.id);
          setPhase(GamePhase.DIALOGUE);
      }
  };

  const handleBattleEnd = (win: boolean, spared: boolean) => {
      if (win) {
        if (currentEnemy) {
            setFlags(prev => ({ ...prev, [currentEnemy.id + '_DEFEATED']: true }));
            setPlayerStats(prev => ({ ...prev, xp: prev.xp + 20, gold: prev.gold + 50 }));
            
            if (currentEnemy.id === 'WEXA') {
                setPhase(GamePhase.ENDING);
            } else {
                setPhase(GamePhase.OVERWORLD);
                // Remove NPC from map logically handled in Overworld render based on flags
            }
        }
      } else {
          setPhase(GamePhase.GAME_OVER);
      }
      setCurrentEnemy(null);
  };

  // --- RENDER ---

  return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
          
          {/* 1. OVERWORLD LAYER (Always rendered if not in pure battle/menu to keep context) */}
          {(phase === GamePhase.OVERWORLD || phase === GamePhase.DIALOGUE || phase === GamePhase.INTRO) && (
               <div className={`transition-opacity duration-500 ${phase === GamePhase.DIALOGUE || phase === GamePhase.INTRO ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <Overworld 
                    currentLocation={location}
                    playerPos={playerPos}
                    onPlayerMove={handlePlayerMove}
                    onChangeLocation={handleLocationChange}
                    onTalk={handleTalkNPC}
                    playerStats={playerStats}
                    flags={flags}
                    isPaused={phase !== GamePhase.OVERWORLD}
                  />
               </div>
          )}

          {/* 2. DIALOGUE OVERLAY */}
          {(phase === GamePhase.INTRO || phase === GamePhase.DIALOGUE) && activeDialogueId && (
              <div className="absolute bottom-10 left