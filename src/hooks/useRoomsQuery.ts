import { ref, onMounted, watch, Ref } from 'vue'
import { print } from 'graphql'
import { GraphQLResponse } from 'src/components/models/AxiosResponse'
import { api } from 'src/boot/axios'

import { getAvailableRoom, getRooms, roomNumberValidation } from '../assets/gql/room.query'
import { RoomPaginationData } from 'src/components/models/PaginatedData'
import Room from 'src/components/models/Room'

import { notify } from 'src/utils'

export function useFetchRooms (roomFetchPagination: Ref<RoomPaginationData>) {
  const result = ref<Room[]>([])
  const total = ref(0)
  const loading = ref(false)

  const page = ref(roomFetchPagination.value.page)

  const fetchRooms = async () => {
    try {
      loading.value = true
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(getRooms),
          variables: {
            getRoomsPagination: {
              page: roomFetchPagination.value.page,
              limit: roomFetchPagination.value.limit,
              filter: roomFetchPagination.value.filter
            }
          }
        }
      }) as unknown as GraphQLResponse<{ getRooms: { rooms: Room[], total: number}}>

      if (response.data.data) {
        result.value = response.data.data.getRooms.rooms
        total.value = response.data.data.getRooms.total
      } else {
        console.log('fetch rooms error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on fetch rooms', (e as Error).message)
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const fetchAvailableRooms = async (fromDate: Date, toDate: Date, people: number) => {
    try {
      loading.value = true
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(getAvailableRoom),
          variables: {
            getAvailableRoomsToDate: toDate,
            getAvailableRoomsFromDate: fromDate,
            getAvailableRoomsPeople: people
          }
        }
      }) as unknown as GraphQLResponse<{ rooms: Room[] }>

      if (response.data.data) {
        result.value = response.data.data.rooms
      } else {
        console.log('fetch available rooms error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on fetch available rooms', (e as Error).message)
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const roomNumberExists = async (roomNumber: string, id: string) => {
    try {
      loading.value = true
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(roomNumberValidation),
          variables: {
            roomNumberExistsNumber: roomNumber,
            roomNumberExistsId: id
          }
        }
      }) as unknown as GraphQLResponse<{ exists: boolean }>

      if (response.data.data) {
        return response.data.data.exists
      } else {
        console.log('fetch validation error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on fetch validation', (e as Error).message)
      console.log(e)
    } finally {
      loading.value = false
    }
    return null
  }

  const nextPage = async () => {
    page.value += 1
    await fetchRooms()
  }

  onMounted(async () => {
    await fetchRooms().catch(e => {
      notify('error', 'Cant fetch Rooms', (e as Error).message)
      console.log(e)
    })
  })

  watch(roomFetchPagination, async () => {
    await fetchRooms()
  })

  return {
    result,
    loading,
    total,
    fetchRooms,
    fetchAvailableRooms,
    roomNumberExists,
    nextPage
  }
}
