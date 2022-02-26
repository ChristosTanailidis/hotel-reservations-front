/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import gql from 'graphql-tag'

export const createUser = gql`
  mutation($createUserData: UserInputData!) {
    user: createUser(data: $createUserData) {
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
export const updateUser = gql`
  mutation($updateUserData: UserInputData!, $updateUserId: String!){
    user: updateUser(data: $updateUserData, id: $updateUserId) {
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

export const deleteUser = gql`
  mutation($deleteUserId: String!) {
    response: deleteUser(id: $deleteUserId)
  }
`
