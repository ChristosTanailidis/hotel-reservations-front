import gql from 'graphql-tag'

export const getReservations = gql`
  query ($getReservationsPagination: PaginatedInputData!) {
    getReservations(pagination: $getReservationsPagination) {
      reservations: data {
        id
        fromDate
        toDate
        createdDate
        people
        paid
        servicesLog
        canceled
        totalPrice
        room {
          id
          number
          levelType
          capacity
          color
        }
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
      total
    }
  }
`

export const getReservationById = gql`
  query ($getReservationByIdId: String!) {
    reservation: getReservationById(id: $getReservationByIdId) {
      id
      fromDate
      toDate
      createdDate
      people
      paid
      canceled
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

export const getActiveReservations = gql`
  query ($getActiveReservationsPagination: PaginatedInputData!) {
    getActiveReservations(pagination: $getActiveReservationsPagination) {
      reservations: data {
        id
        fromDate
        toDate
        createdDate
        people
        canceled
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
      total
    }
  }
`
export const getCanceledReservations = gql`
  query($getCanceledReservationsPagination: PaginatedInputData!) {
    getCanceledReservations(pagination: $getCanceledReservationsPagination) {
      reservations: data {
        id
        fromDate
        toDate
        createdDate
        people
        paid
        servicesLog
        canceled
        totalPrice
        room {
          id
          number
          levelType
          capacity
          color
        }
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
      total
    }
  }
`
