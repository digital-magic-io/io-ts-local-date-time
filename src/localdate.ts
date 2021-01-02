import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import moment from 'moment'
import { regexRefinement } from '@digital-magic/fp-ts-extensions/lib/refinements'
import { decoder, encoder, unsafeDecode } from '@digital-magic/io-ts-extensions'

export const ISOLocalDateRegex = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/

export const LocalDate = t.brand(t.string, regexRefinement(ISOLocalDateRegex), 'LocalDate')
export type LocalDate = t.TypeOf<typeof LocalDate>
export const localDate = unsafeDecode<LocalDate, string, typeof LocalDate>(LocalDate)

export const DateFromLocalDateDecoder = decoder<LocalDate, Date>('DateFromLocalDate', (u, c) =>
  // const result = moment(v)
  // return result.isValid() ? E.right(result.toDate()) : E.left('')
  E.either.map(LocalDate.validate(u, c), (v) => new Date(v))
)

export const dateFromLocalDateEncoder = (dateFormat: string) =>
  encoder<Date, LocalDate>((v) => localDate(moment(v).format(dateFormat)))

// example how to build a codec
/*
export const DateFromLocalDate = codec<Date, LocalDate, LocalDate>(LocalDateDecoder, localDateEncoder(''), date.is) // // TODO: Not sure if IS definition is correct
*/
