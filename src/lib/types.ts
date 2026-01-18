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

/**
 * Extends GameState with Firestore storage metadata
 */
export interface StoredGameState extends GameState {
  id?: string;           // Firestore document ID (set when retrieved)
  createdAt: string;     // ISO timestamp when game started
  updatedAt: string;     // ISO timestamp of last update
  completedAt?: string;  // ISO timestamp when game ended (history only)
}
