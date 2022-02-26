import { ref, onMounted, Ref, watch } from 'vue'
import { api } from 'src/boot/axios'
import { print } from 'graphql'
import { GraphQLResponse } from 'src/components/models/AxiosResponse'

import { getCanceledReservations, getReservations } from '../assets/gql/reservation.query'
import { ReservationPaginationData } from 'src/components/models/PaginatedData'
import Reservation from 'src/components/models/Reservation'

import { notify } from 'src/utils'

export function useFetchReservations (reservationFetchPagination: Ref<ReservationPaginationData>) {
  const result = ref<Reservation[]>([])
  const canceledResult = ref<Reservation[]>([])
  const total = ref(0)
  const canceledTotal = ref(0)
  const loading = ref(false)

  const page = ref(reservationFetchPagination.value.page)

  const fetchReservations = async () => {
    try {
      loading.value = true
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(getReservations),
          variables: {
            getReservationsPagination: {
              page: reservationFetchPagination.value.page,
              limit: reservationFetchPagination.value.limit,
              filter: reservationFetchPagination.value.filter
            }
          }
        }
      }) as unknown as GraphQLResponse<{ getReservations: { reservations: Reservation[], total: number}}>

      if (response.data.data) {
        result.value = response.data.data.getReservations.reservations
        total.value = response.data.data.getReservations.total
      } else {
        console.log('fetch reservations error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on fetch reservations', (e as Error).message)
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const fetchCanceledReservations = async () => {
    try {
      loading.value = true
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(getCanceledReservations),
          variables: {
            getCanceledReservationsPagination: {
              page: reservationFetchPagination.value.page,
              limit: reservationFetchPagination.value.limit,
              filter: reservationFetchPagination.value.filter
            }
          }
        }
      }) as unknown as GraphQLResponse<{ getCanceledReservations: { reservations: Reservation[], total: number}}>

      if (response.data.data) {
        canceledResult.value = response.data.data.getCanceledReservations.reservations
        canceledTotal.value = response.data.data.getCanceledReservations.total
      } else {
        console.log('fetch canceled reservations error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on fetch canceled reservations', (e as Error).message)
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const nextPage = async () => {
    page.value += 1
    await fetchReservations()
  }

  onMounted(async () => {
    await fetchReservations().catch(e => {
      notify('error', 'Cant fetch Reservations', (e as Error).message)
      console.log(e)
    })
    await fetchCanceledReservations().catch(e => {
      notify('error', 'Cant fetch canceled Reservations', (e as Error).message)
      console.log(e)
    })
  })

  watch(reservationFetchPagination.value, async () => {
    await fetchReservations()
    await fetchCanceledReservations()
  })

  watch(reservationFetchPagination, async () => {
    await fetchReservations()
    await fetchCanceledReservations()
  })

  return {
    result,
    canceledResult,
    loading,
    total,
    canceledTotal,
    fetchReservations,
    fetchCanceledReservations,
    nextPage
  }
}
