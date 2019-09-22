export interface IBSheetCreateOptions {}

export interface IBSheetStatic {
  create: (options: IBSheetCreateOptions) => void
}

export interface IBSheetInstance {
  id: string
  length: number
}
