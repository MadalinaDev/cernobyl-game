interface GameHUDProps {
  player: {
    hp: number;
    hpMax: number;
    keys: number;
    radRes: number;
    materials: {
      scrap: number;
      circuits: number;
      chemicals: number;
    };
  };
  roomName: string;
  nearBench: boolean;
}

export default function GameHUD({ player, roomName, nearBench }: GameHUDProps) {
  return (
    <div className="absolute left-4 top-4 text-white font-mono text-sm">
      <div className="mb-1">{roomName}</div>
      <div className="mb-1">
        HP: {player.hp.toFixed(0)}/{player.hpMax}
      </div>
      <div className="mb-1">Keys: {player.keys}</div>
      <div className="mb-1">Rad Res: {(player.radRes * 100).toFixed(0)}%</div>
      <div className="mb-1">
        Materials: S{player.materials.scrap} C{player.materials.circuits} Ch
        {player.materials.chemicals}
      </div>
      {nearBench && (
        <div className="text-green-400 mt-2">Press "C" to craft</div>
      )}
    </div>
  );
}
