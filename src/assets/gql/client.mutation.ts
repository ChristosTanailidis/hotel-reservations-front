import gql from 'graphql-tag'

export const createClient = gql`
  mutation($createClientData: ClientInputData!) {
    client: createClient(data: $createClientData) {
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

export const updateClient = gql`
  mutation($updateClientData: ClientInputData!, $updateClientId: String!) {
    client: updateClient(data: $updateClientData, id: $updateClientId) {
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

export const deleteClient = gql`
  mutation($deleteClientId: String!) {
    response: deleteClient(id: $deleteClientId)
  }
`
