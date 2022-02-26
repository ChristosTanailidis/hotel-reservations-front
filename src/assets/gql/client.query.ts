import gql from 'graphql-tag'

export const getClients = gql`
  query ($getClientsPagination: PaginatedInputData!) {
    getClients(pagination: $getClientsPagination) {
      clients: data {
        id
        email
        name
        surname
        phone
        reservations {
          id
          fromDate
          toDate
          createdDate
          paid
          people
          servicesLog
          totalPrice
          createdBy {
            id
            email
            fullName
            role
          }
          room {
            id
            capacity
            levelType
            number
            color
          }
        }
      }
      total
    }
  }
`

export const getClientByEmail = gql`
  query ($getClientByEmailEmail: String!) {
    client: getClientByEmail(email: $getClientByEmailEmail) {
      id
      email
      name
      surname
      phone
      reservations {
        id
        fromDate
        toDate
        createdDate
        paid
        people
        servicesLog
        totalPrice
        createdBy {
          id
          email
          fullName
          role
        }
        room {
          id
          capacity
          levelType
          number
          color
        }
      }
    }
  }
`

export const clientEmailValidation = gql`
  query ($clientEmailExistsEmail: String!, $clientEmailExistsId: String!) {
    exists: clientEmailExists(email: $clientEmailExistsEmail, id: $clientEmailExistsId)
  }
`
