import { LocalTime } from '../src/localtime'
import { isRight } from 'fp-ts/lib/Either'

test('LocalTime is decoded correctly', () => {
  expect(isRight(LocalTime.decode('1:1'))).toBeFalsy()
  expect(isRight(LocalTime.decode('25:00'))).toBeFalsy()
  expect(isRight(LocalTime.decode('24:00'))).toBeFalsy()
  expect(isRight(LocalTime.decode('23:0'))).toBeFalsy()
  expect(isRight(LocalTime.decode('23:60'))).toBeFalsy()
  expect(isRight(LocalTime.decode('023:60'))).toBeFalsy()
  expect(isRight(LocalTime.decode('23:600'))).toBeFalsy()
  expect(isRight(LocalTime.decode(''))).toBeFalsy()
  expect(isRight(LocalTime.decode('dd-dd-dddd'))).toBeFalsy()
  expect(isRight(LocalTime.decode(undefined))).toBeFalsy()
  expect(isRight(LocalTime.decode(null))).toBeFalsy()
  expect(isRight(LocalTime.decode('00:00'))).toBeTruthy()
  expect(isRight(LocalTime.decode('23:59'))).toBeTruthy()
})
