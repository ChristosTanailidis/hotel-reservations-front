/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import gql from 'graphql-tag'

export const createReservation = gql`
  mutation($createReservationData: ReservationInputData!) {
    reservation: createReservation(data: $createReservationData) {
      id
      fromDate
      toDate
      createdDate
      people
      paid
      servicesLog
      totalPrice
      client {
        id
        email
        phone
        name
        surname
      }
      createdBy {
        id
        email
        fullName
        role
      }
    }
  }
`

export const updateReservation = gql`
  mutation($updateReservationIsClientsDecision: Boolean!, $updateReservationData: ReservationInputData!, $updateReservationId: String!) {
    reservation: updateReservation(isClientsDecision: $updateReservationIsClientsDecision, data: $updateReservationData, id: $updateReservationId) {
      id
      fromDate
      toDate
      createdDate
      people
      paid
      servicesLog
      totalPrice
      client {
        id
        email
        phone
        name
        surname
      }
      createdBy {
        id
        email
        fullName
        role
      }
   }
  }
`

export const closeReservation = gql`
  mutation($closeReservationId: String!) {
    cost: closeReservation(id: $closeReservationId)
  }
`

export const cancelReservation = gql`
  mutation($cancelReservationId: String!) {
    cost: cancelReservation(id: $cancelReservationId)
  }
`
