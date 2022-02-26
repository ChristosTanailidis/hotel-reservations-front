import Reservation from './Reservation'

export default interface Room {
  id: string,
  capacity: number,
  number: string,
  color: string,
  levelType: number
  reservations: Reservation[]
}
