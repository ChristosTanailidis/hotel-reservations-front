import { print } from 'graphql'
import { api } from 'src/boot/axios'
import { GraphQLResponse } from 'src/components/models/AxiosResponse'

import { createRoom, deleteRoom, updateRoom } from 'src/assets/gql/room.mutation'
import RoomInputData from 'src/components/models/InputData/RoomInputData'
import Room from 'src/components/models/Room'

import { notify } from 'src/utils'

export function useRoomsMutation () {
  const addRoom = async (room: RoomInputData) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(createRoom),
          variables: {
            createRoomData: {
              ...room
            }
          }
        }
      }) as unknown as GraphQLResponse<{ room: Room }>

      if (response.data.data) {
        return response.data.data.room
      } else {
        notify('error', 'Add room error')
        console.log('add room error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on add room', (e as Error).message)
      console.log(e)
    }
  }

  const editRoom = async (room: RoomInputData, roomId: string) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(updateRoom),
          variables: {
            updateRoomData: {
              ...room
            },
            updateRoomId: roomId
          },
          errors: []
        }
      }) as unknown as GraphQLResponse<{ room: Room }>

      if (response.data.data) {
        return response.data.data.room
      } else {
        notify('error', 'Update room error')
        console.log('update room error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on update room', (e as Error).message)
      console.log(e)
    }
  }

  const removeRoom = async (roomId: string) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(deleteRoom),
          variables: {
            deleteRoomId: roomId
          }
        }
      }) as unknown as GraphQLResponse<{ response: boolean }>

      if (response.data.data) {
        return response.data.data.response
      } else {
        notify('error', 'Delete client error')
        console.log('delete client error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on delete client', (e as Error).message)
      console.log(e)
    }
  }

  return {
    addRoom,
    editRoom,
    removeRoom
  }
}
