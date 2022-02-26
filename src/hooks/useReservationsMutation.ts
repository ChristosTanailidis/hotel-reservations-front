import { print } from 'graphql'
import { api } from 'src/boot/axios'
import { GraphQLResponse } from 'src/components/models/AxiosResponse'

import { cancelReservation, closeReservation, createReservation, updateReservation } from 'src/assets/gql/reservation.mutation'
import ReservationInputData from 'src/components/models/InputData/ReservationInputData'
import Reservation from 'src/components/models/Reservation'

import { notify } from 'src/utils'

export function useReservationsMutation () {
  const addNewReservation = async (reservation: ReservationInputData) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(createReservation),
          variables: {
            createReservationData: {
              ...reservation
            }
          }
        }
      }) as unknown as GraphQLResponse<{ reservation: Reservation }>

      if (response.data.data) {
        return response.data.data.reservation
      } else {
        notify('error', 'Create Reservation error')
        console.log('create reservation error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on add new reservation', (e as Error).message)
      console.log(e)
    }
  }

  const editReservation = async (isClientsDecision: boolean, reservation: ReservationInputData, reservationId: string) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(updateReservation),
          variables: {
            updateReservationIsClientsDecision: isClientsDecision,
            updateReservationData: {
              ...reservation
            },
            updateReservationId: reservationId
          }
        }
      }) as unknown as GraphQLResponse<{ reservation: Reservation }>

      if (response.data.data) {
        return response.data.data.reservation
      } else {
        notify('error', 'Update reservation error')
        console.log('update reservation error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on update reservation', (e as Error).message)
      console.log(e)
    }
  }

  const cancelRes = async (reservationId: string) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(cancelReservation),
          variables: {
            cancelReservationId: reservationId
          }
        }
      }) as unknown as GraphQLResponse<{ cost: number }>

      if (response.data.data) {
        return response.data.data.cost
      } else {
        notify('error', 'Cancel reservation error')
        console.log('cancel reservation error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on cancel reservation', (e as Error).message)
      console.log(e)
    }
  }

  const closeRes = async (reservationId: string) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(closeReservation),
          variables: {
            closeReservationId: reservationId
          }
        }
      }) as unknown as GraphQLResponse<{ cost: number }>

      if (response.data.data) {
        return response.data.data.cost
      } else {
        notify('error', 'Close reservation error')
        console.log('close reservation error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on close reservation', (e as Error).message)
      console.log(e)
    }
  }

  return {
    addNewReservation,
    editReservation,
    cancelRes,
    closeRes
  }
}
