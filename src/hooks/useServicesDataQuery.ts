import { ref, onMounted, Ref, watch } from 'vue'
import { print } from 'graphql'
import { api } from 'src/boot/axios'
import { GraphQLResponse } from 'src/components/models/AxiosResponse'

import { getServicesData } from '../assets/gql/servicesData.query'
import { Service } from 'src/components/models/Reservation'

import { notify } from 'src/utils'

export function useFetchServicesData (roomLevel: Ref<number>) {
  const foodResult = ref<Service[]>()
  const spaResult = ref<Service[]>()
  const loading = ref(false)

  const fetchServicesData = async () => {
    try {
      loading.value = true
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(getServicesData),
          variables: {
            getServicesDataRoomLevel: roomLevel.value
          }
        }
      }) as unknown as GraphQLResponse<{serviceData: {foodData: Service[], spaData: Service[]}}>

      if (response.data.data) {
        foodResult.value = response.data.data.serviceData.foodData
        spaResult.value = response.data.data.serviceData.spaData
      } else {
        console.log('fetch services data', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on fetch services', (e as Error).message)
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await fetchServicesData().catch(e => {
      notify('error', 'Cant fetch Services', (e as Error).message)
      console.log(e)
    })
  })

  watch(roomLevel, async () => {
    await fetchServicesData()
  })

  return {
    foodResult,
    spaResult,
    loading,

    fetchServicesData
  }
}
