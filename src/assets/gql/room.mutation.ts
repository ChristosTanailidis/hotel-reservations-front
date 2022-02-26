import gql from 'graphql-tag'

export const createRoom = gql`
  mutation($createRoomData: RoomInputData!) {
    room: createRoom(data: $createRoomData) {
      id
      number
      levelType
      capacity
      color
    }
  }
`

export const updateRoom = gql`
  mutation($updateRoomData: RoomInputData!, $updateRoomId: String!) {
    room: updateRoom(data: $updateRoomData, id: $updateRoomId) {
      id
      color
      capacity
      levelType
      number
    }
  }
`

export const deleteRoom = gql`
  mutation($deleteRoomId: String!) {
    response: deleteRoom(id: $deleteRoomId)
  }
`
