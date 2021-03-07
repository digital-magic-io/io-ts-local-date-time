import { isRight } from 'fp-ts/Either'
import { LocalDate } from '../src/localdate'

test('LocalDate is decoded correctly', () => {
  expect(isRight(LocalDate.decode('10-12-2000'))).toBeFalsy()
  expect(isRight(LocalDate.decode('1-1-2000'))).toBeFalsy()
  expect(isRight(LocalDate.decode(''))).toBeFalsy()
  expect(isRight(LocalDate.decode('dd-dd-dddd'))).toBeFalsy()
  expect(isRight(LocalDate.decode(undefined))).toBeFalsy()
  expect(isRight(LocalDate.decode(null))).toBeFalsy()
  expect(isRight(LocalDate.decode('2000-1-1'))).toBeFalsy()
  expect(isRight(LocalDate.decode('2000-12-10'))).toBeTruthy()
})
