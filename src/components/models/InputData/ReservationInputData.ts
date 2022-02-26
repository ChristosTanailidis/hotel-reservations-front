import { Service } from '../Reservation'

export default interface ReservationInputData {
  roomId: string,
  clientId: string,
  fromDate: Date,
  toDate: Date,
  people: number,
  servicesLog: Service[],
  paid: boolean
}
