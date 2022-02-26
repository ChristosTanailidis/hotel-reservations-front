import Client from './Client'
import Room from './Room'
import User from './User'

export interface Service {
  type: string,
  fromDate: Date,
  toDate: Date,
  cost: number
}

export default interface Reservation {
  id: string,
  room: Room,
  client: Client,
  fromDate: Date,
  toDate: Date,
  people: number,
  servicesLog: Service[],
  totalPrice: number,
  paid: boolean,
  createdDate: Date,
  createdBy: User,
  canceled: boolean
}
