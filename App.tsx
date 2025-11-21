import React, { useState, useEffect } from 'react';
import { GamePhase, LocationId, PlayerStats, Enemy, Position } from './types';
import { INITIAL_PLAYER_STATS, ENEMIES, DIALOGUES, MAPS } from './constants';
import { BattleSystem } from './components/BattleSystem';
import { Overworld } from './components/Overworld';
import { Typewriter } from './components/Typewriter';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.INTRO);
  const [location, setLocation] = useState<LocationId>(LocationId.BEDROOM);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  const [activeDialogueId, setActiveDialogueId] = useState<string | null>('INTRO');
  const [currentDialogueNodeId, setCurrentDialogueNodeId] = useState<string>('1');

  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);

  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isInitialized) {
      const startMap = MAPS[LocationId.BEDROOM];
      setPlayerPos({
        x: startMap.playerStart.x * 40,
        y: startMap.playerStart.y * 40,
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleNextDialogue = () => {
    if (!activeDialogueId) return;
    const nodes = DIALOGUES[activeDialogueId];
    const node = nodes.find((n) => n.id === currentDialogueNodeId);

    if (node) {
      if (node.triggerBattle) {
        setPhase(GamePhase.BATTLE);
        const enemy = ENEMIES[node.triggerBattle];
        setCurrentEnemy({ ...enemy, hp: enemy.maxHp });
        setActiveDialogueId(null);
        return;
      }

      if (node.next && node.next !== 'end') {
        const nextNode = nodes.find((n) => n.id === node.next);
        if (nextNode) setCurrentDialogueNodeId(node.next);
        else endDialogue();
      } else {
        endDialogue();
      }
    }
  };

  const endDialogue = () => {
    setActiveDialogueId(null);
    if (phase === GamePhase.INTRO || phase === GamePhase.DIALOGUE)
      setPhase(GamePhase.OVERWORLD);
  };

  const handleLocationChange = (newLoc: LocationId, startTileX: number, startTileY: number) => {
    setLocation(newLoc);
    setPlayerPos({ x: startTileX * 40, y: startTileY * 40 });
  };

  const handlePlayerMove = (newPos: Position) => {
    setPlayerPos(newPos);
  };

  const handleTalkNPC = (npcId: string) => {
    if (flags[npcId + '_DEFEATED'] && npcId !== 'WALTEY_INTRO') return;

    if (DIALOGUES[npcId]) {
      setActiveDialogueId(npcId);
      const firstNode = DIALOGUES[npcId][0];
      setCurrentDialogueNodeId(firstNode.id);
      setPhase(GamePhase.DIALOGUE);
    }
  };

  const handleBattleEnd = (win: boolean) => {
    if (win) {
      if (currentEnemy) {
        setFlags((prev) => ({
          ...prev,
          [currentEnemy.id + '_DEFEATED']: true,
        }));

        setPlayerStats((prev) => ({
          ...prev,
          xp: prev.xp + 20,
          gold: prev.gold + 50,
        }));

        if (currentEnemy.id === 'WEXA') {
          setPhase(GamePhase.ENDING);
        } else {
          setPhase(GamePhase.OVERWORLD);
        }
      }
    } else {
      setPhase(GamePhase.GAME_OVER);
    }
    setCurrentEnemy(null);
  };

  if (!isInitialized)
    return <div className="bg-black h-screen text-white">Yükleniyor...</div>;

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">

      {(phase === GamePhase.OVERWORLD ||
        phase === GamePhase.DIALOGUE ||
        phase === GamePhase.INTRO) && (
        <div
          className={`transition-opacity duration-500 ${
            phase === GamePhase.DIALOGUE || phase === GamePhase.INTRO
              ? 'opacity-40 pointer-events-none'
              : 'opacity-100'
          }`}
        >
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

      {(phase === GamePhase.INTRO || phase === GamePhase.DIALOGUE) &&
        activeDialogueId && (
          <div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[90%] max-w-3xl border-4 border-white bg-black p-6 z-50 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            onClick={handleNextDialogue}
          >
            {(() => {
              const nodes = DIALOGUES[activeDialogueId];
              const node = nodes.find((n) => n.id === currentDialogueNodeId);
              if (!node) return null;
              return (
                <div className="flex gap-4 items-start">
                  <div className="text-6xl animate-bounce min-w-[80px] h-[80px] flex items-center justify-center border-2 border-white bg-gray-900">
                    {node.face}
                  </div>
                  <div className="flex-1">
                    <div className="text-yellow-400 text-xl font-bold mb-2 uppercase tracking-wider border-b border-gray-700 pb-1">
                      {node.speaker}
                    </div>
                    <div className="text-2xl leading-relaxed font-mono text-white min-h-[80px]">
                      <Typewriter key={node.id} text={node.text} speed={15} />
                    </div>
                    <div className="text-right mt-2 animate-pulse text-gray-500 text-sm">
                      [TIKLA / ENTER]
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      {phase === GamePhase.BATTLE && currentEnemy && (
        <div className="absolute inset-0 z-50 bg-black">
          <BattleSystem
            enemy={currentEnemy}
            playerStats={playerStats}
            onBattleEnd={handleBattleEnd}
            setPlayerStats={setPlayerStats}
          />
        </div>
      )}

      {phase === GamePhase.GAME_OVER && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-center text-white">
          <h1 className="text-6xl text-red-600 mb-4 font-bold animate-pulse">
            DOLANDIRILDIN.
          </h1>
          <p className="text-gray-400 mb-8">Hesabın boşaltıldı.</p>
          <button
            onClick={() => window.location.reload()}
            className="border-2 border-white px-6 py-3 hover:bg-white hover:text-black text-xl font-bold transition-colors"
          >
            BAŞA DÖN
          </button>
        </div>
      )}

      {phase === GamePhase.ENDING && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-center text-white p-8">
          <h1 className="text-6xl text-yellow-400 mb-8 font-bold pixel-borders p-4 animate-bounce">
            MUTLU SON?
          </h1>
          <div className="max-w-2xl text-xl space-y-6 leading-relaxed text-left border border-white p-8 bg-gray-900/50">
            <p>Ahmet, Wexa'nın teklifini reddetti ve "Unsubscribe" tuşuna bastı.</p>
            <p className="text-gray-400">*sistem çökme sesleri*</p>
            <p>Gözlerini açtığında kendi yatağındaydı. Ter içindeydi.</p>
            <p>
              Telefonuna bir bildirim geldi:{' '}
              <span className="text-green-400">"Maaşınız yatmıştır."</span>
            </p>
            <p>"Oh be," dedi Ahmet. "Gerçek hayat daha az stresli... sanırım."</p>
            <p className="text-xs text-gray-500 mt-10 text-center">
              YAPIMCI: AHMET'İN ABSÜRT PARALEL EVRENİ EKİBİ
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-8 border-2 border-white px-6 py-3 hover:bg-white hover:text-black text-xl font-bold"
          >
            TEKRAR OYNA
          </button>
        </div>
      )}

    </div>
  );
}
