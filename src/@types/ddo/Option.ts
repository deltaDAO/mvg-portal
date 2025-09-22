export interface OptionDetail {
  [key: string]: string
}

export interface Option {
  [key: string]: string | number | boolean | OptionDetail[]
}
