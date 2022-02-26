import gql from 'graphql-tag'

export const getRooms = gql`
  query ($getRoomsPagination: PaginatedInputData!) {
    getRooms(pagination: $getRoomsPagination) {
      rooms: data {
        id
        number
        levelType
        capacity
        color
        reservations {
          id
          fromDate
          toDate
          people
          paid
          totalPrice
          servicesLog
          createdDate
          client {
            id
            email
            name
            surname
            phone
          }
          createdBy {
            id
            email
            fullName
            role
          }
        }
      }
      total
    }
  }
`
export const getAvailableRoom = gql`
  query ($getAvailableRoomsFromDate: DateTime!, $getAvailableRoomsToDate: DateTime!, $getAvailableRoomsPeople: Float!) {
   rooms: getAvailableRooms(toDate: $getAvailableRoomsToDate, fromDate: $getAvailableRoomsFromDate, people: $getAvailableRoomsPeople) {
      id
      capacity
      levelType
      number
      color
      reservations {
        id
        fromDate
        toDate
        people
        paid
        totalPrice
        servicesLog
        createdDate
        client {
          id
          email
          name
          surname
          phone
        }
        createdBy {
          id
          email
          fullName
          role
        }
      }
    }
  }
`

export const roomNumberValidation = gql`
  query ($roomNumberExistsNumber: String!, $roomNumberExistsId: String!) {
    exists: roomNumberExists(number: $roomNumberExistsNumber, id: $roomNumberExistsId)
  }
`
