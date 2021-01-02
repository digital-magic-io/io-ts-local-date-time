import * as t from 'io-ts'
import * as O from 'fp-ts/lib/Option'
import * as A from 'fp-ts/lib/ReadonlyArray'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { contramap, Ord, ordNumber } from 'fp-ts/lib/Ord'
import { sequenceT } from 'fp-ts/lib/Apply'
import { LocalTime, secondsFromLocalTime, SecondsFromLocalTimeDecoder, secondsFromLocalTimeEncoder } from './localtime'
import { decoder, encoder, unsafeDecode } from '@digital-magic/io-ts-extensions'

export const SecondsTimeSlot = t.type(
  {
    timeSince: t.number, // TODO: Branded type
    timeBefore: t.number
  },
  'TimeSlot'
)
export type SecondsTimeSlot = t.TypeOf<typeof SecondsTimeSlot>

export const TimeSlot = t.type(
  {
    timeSince: LocalTime,
    timeBefore: LocalTime
  },
  'TimeSlot'
)
export type TimeSlot = t.TypeOf<typeof TimeSlot>

export const SecondsTimeSlotToTimeSlotDecoder = decoder<TimeSlot, SecondsTimeSlot>('ApiTimeSlotToTimeSlot', (u, c) =>
  E.flatten(
    E.either.map(TimeSlot.validate(u, c), (v) => {
      const timeSince = SecondsFromLocalTimeDecoder.validate(v.timeSince, c)
      const timeBefore = SecondsFromLocalTimeDecoder.validate(v.timeBefore, c)
      return pipe(
        sequenceT(E.either)(timeSince, timeBefore),
        E.map(([ts, tb]) => {
          return {
            timeSince: ts,
            timeBefore: tb
          }
        })
      )
    })
  )
)

export const secondsTimeSlotToTimeSlotEncoder = (dateFormat: string) =>
  encoder<SecondsTimeSlot, TimeSlot>((v) => {
    return {
      timeSince: secondsFromLocalTimeEncoder(dateFormat).encode(v.timeSince),
      timeBefore: secondsFromLocalTimeEncoder(dateFormat).encode(v.timeBefore)
    }
  })

// Example how to build codec
/*
export const SecondsTimeSlotToTimeSlot = codec<SecondsTimeSlot, TimeSlot, TimeSlot>(SecondsTimeSlotToTimeSlotDecoder, secondsTimeSlotToTimeSlotEncoder(''), SecondsTimeSlot.is)
*/

export const secondsTimeSlotToTimeSlot = unsafeDecode<
  SecondsTimeSlot,
  TimeSlot,
  typeof SecondsTimeSlotToTimeSlotDecoder
>(SecondsTimeSlotToTimeSlotDecoder)

export const timeSlotOrd: Ord<TimeSlot> = contramap((v: TimeSlot) => secondsFromLocalTime(v.timeBefore))(ordNumber)

export function slotOverlaps(x: SecondsTimeSlot, y: SecondsTimeSlot): boolean {
  return x.timeSince <= y.timeBefore && y.timeSince <= x.timeBefore
}

interface Pair<T1, T2> {
  readonly first: T1
  readonly second: T2
}

function pair<T1, T2>(first: T1, second: T2): Pair<T1, T2> {
  return { first, second }
}

function getLastTimeSlot(acc: ReadonlyArray<Pair<O.Option<TimeSlot>, TimeSlot>>): O.Option<TimeSlot> {
  return pipe(
    acc,
    A.last,
    O.map((v) => v.second)
  )
}

export function hasOverlaps(slots: ReadonlyArray<TimeSlot>): boolean {
  return pipe(
    slots,
    A.sort(timeSlotOrd),
    A.reduce([], (acc: ReadonlyArray<Pair<O.Option<TimeSlot>, TimeSlot>>, current: TimeSlot) =>
      acc.concat(pair(getLastTimeSlot(acc), current))
    ),
    A.filterMap(({ first, second }) =>
      pipe(
        first,
        O.map((v) => pair(v, second))
      )
    ),
    // TODO: Not a type safe code: secondsTimeSlotToTimeSlot - consider refactoring
    A.map(({ first, second }) => slotOverlaps(secondsTimeSlotToTimeSlot(first), secondsTimeSlotToTimeSlot(second)))
  ).some((v) => v)
}
