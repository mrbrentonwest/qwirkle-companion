export interface UserIdentity {
  passphrase: string;
  userId: string;
}

export interface TurnScore {
    turnNumber: number;
    score: number;
    isQwirkle: boolean;
    type: 'manual' | 'auto-score' | 'helper' | 'swap' | 'bonus';
}
  
export interface Player {
    id: string;
    name: string;
    scores: TurnScore[];
    totalScore: number;
}
  
export interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    round: number;
    isGameActive: boolean;
    isGameOver: boolean;
}
