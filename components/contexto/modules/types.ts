export interface Guess {
  word: string
  rank: number
}

export interface GameInfo {
  id: number
  createdDate: string
  status: string
}

export interface GameProgress {
  guesses: Guess[]
  hints: number
  gameStartTime: string | null
  gameWon: boolean
  gameGaveUp: boolean
  gameCompletionTime: number | null
  secretWord: string
  lastUpdated: string
}