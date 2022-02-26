import gql from 'graphql-tag'

export const getUsers = gql`
  query ($getUsersPagination: PaginatedInputData!) {
    getUsers(pagination: $getUsersPagination) {
      users {
        id
        fullName
        email
        role
        reservations {
          id
          room {
            number
          }
          client {
            email
          }
          toDate
          fromDate
          people
          totalPrice
          paid
          createdDate
          createdBy {
            fullName
            role
          }
        }
      }
      total
    }
  }
`
export const getUserById = gql`
  query ($getUserByIdId: String!) {
    user: getUserById(id: $getUserByIdId) {
      id
      email
      role
      fullName
      reservations {
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
          name
          surname
          phone
        }
      }
    }
  }
`
