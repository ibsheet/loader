export interface IBMapCreateOptions {
  elem?: string
  cfg?: object
}

export interface IBMapInstance {
  _groupIndex: number
  dispose(): void
}
