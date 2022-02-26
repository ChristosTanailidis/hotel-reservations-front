import Reservation from './Reservation'

export default interface Client {
  id: string,
  name: string,
  surname: string,
  phone: string,
  email: string,
  reservations: Reservation[]
}
