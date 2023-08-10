import type { AscensionKey, CharacterKey } from '../consts'

export interface ICharacter {
  key: CharacterKey
  level: number
  constellation: number
  ascension: AscensionKey
  talent: {
    auto: number
    skill: number
    burst: number
  }
}