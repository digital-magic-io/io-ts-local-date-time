import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import { between, contramap, gt, Ord, ordNumber } from 'fp-ts/Ord'
import { Refinement } from 'fp-ts/function'
import moment from 'moment'
import { regexRefinement } from '@digital-magic/fp-ts-extensions/lib/refinements'
import { decoder, encoder, unsafeDecode } from '@digital-magic/io-ts-extensions'

// export const Time24hRegExp = /^(2[0-3]|[0-1]?[\d]):[0-5][\d]:[0-5][\d]$/ // With seconds
export const Time24hRegExp = /^(2[0-3]|[0-1]?[\d]):[0-5][\d]$/ // No seconds

export const timeSeparator = ':'

export const LocalTime = t.brand(t.string, regexRefinement(Time24hRegExp), 'LocalTime')
export type LocalTime = t.TypeOf<typeof LocalTime>
export const localTime = unsafeDecode<LocalTime, string, typeof LocalTime>(LocalTime)

export const localTimeToSeconds = (v: LocalTime): number => {
  const [h, m] = v.split(timeSeparator)
  // tslint:disable-next-line:radix
  return parseInt(h) * 60 * 60 + parseInt(m) * 60
}

export const SecondsFromLocalTimeDecoder = decoder<LocalTime, number>('SecondsFromLocalTime', (u, c) =>
  E.either.map(LocalTime.validate(u, c), localTimeToSeconds)
)

export const secondsFromLocalTimeEncoder = (dateFormat: string): t.Encoder<number, LocalTime> =>
  encoder<number, LocalTime>((v) => localTime(moment().startOf('day').add(v, 'second').format(dateFormat)))

// example how to build a codec
/*
export const SecondsFromLocalTime = codec<number, LocalTime, LocalTime>(SecondsFromLocalTimeDecoder, secondsFromLocalTimeEncoder(''), t.number.is)
*/

export const secondsFromLocalTime = unsafeDecode<number, LocalTime, typeof SecondsFromLocalTimeDecoder>(
  SecondsFromLocalTimeDecoder
)

export const timeOrd: Ord<LocalTime> = contramap(localTimeToSeconds)(ordNumber)
export const timeGreater = gt<LocalTime>(timeOrd)
export const timeBetween = between(timeOrd)

export type LocalTimeRefinement<T extends LocalTime> = Refinement<LocalTime, T>

export function localTimeIsLesserRefinement<T extends LocalTime>(compareTo: LocalTime): LocalTimeRefinement<T> {
  return (v): v is T => timeOrd.compare(v, compareTo) === -1
}

export function localTimeIsGreaterRefinement<T extends LocalTime>(compareTo: LocalTime): LocalTimeRefinement<T> {
  return (v): v is T => timeOrd.compare(v, compareTo) === 1
}
