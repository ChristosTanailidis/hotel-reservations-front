import Reservation from './Reservation'

export default interface User {
  id: string,
  fullName: string,
  email: string,
  role: string,
  reservations: Reservation[]
}
