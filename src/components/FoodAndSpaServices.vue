<template>
  <!-- FOOD SERVICES -->
  <ServiceItem
    :services="foodServices"
    :key="foodServices"
    v-model:reservation="reservationObj"
  />

  <!-- SPA SERVICES -->
  <ServiceItem
    :services="spaServices"
    :key="spaServices"
    v-model:reservation="reservationObj"
  />
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch, computed } from 'vue'
import { useFetchServicesData } from 'src/hooks/useServicesDataQuery'

import ServiceItem from 'src/components/simpleComponents/ServicesItem.vue'
import Reservation, { Service } from 'src/components/models/Reservation'

import { getShortDate, isNewReservation } from 'src/utils'

export default defineComponent({
  name: 'FoodAndSpaViewComponent',
  emits: ['update:reservation'],
  components: {
    ServiceItem
  },
  props: {
    reservation: {
      type: Object as PropType<Reservation>,
      required: true
    }
  },

  // todo: delete this component and take all the code a node back (this -> parent)
  setup (props, { emit }) {
    const reservationObj = ref(props.reservation)
    const roomLevel = computed(() => {
      // loadDates()
      return reservationObj.value.room.levelType
    })

    const { foodResult, spaResult, fetchServicesData } = useFetchServicesData(roomLevel)

    // food services to send
    const foodServices = ref<Service[]>([] as Service[])
    watch(foodResult, () => {
      foodServices.value = foodResult.value as Service[]
      loadDates()
    })

    // spa services to send
    const spaServices = ref<Service[]>([] as Service[])
    watch(spaResult, () => {
      spaServices.value = spaResult.value as Service[]
      loadDates()
    })

    onMounted(async () => {
      // create food and spa servicies items
      await fetchServicesData()

      loadDates()

      // <============== Works only on Edit Reservation ==============>
      // in case of edit reservation change the services default values on selected services

      if (!isNewReservation(reservationObj.value.id)) {
        foodServices.value.forEach(fs => {
          const resService = reservationObj.value.servicesLog.find(rs => rs.type === fs.type)
          if (resService) {
            fs.cost = parseInt(resService.cost.toString())
            fs.fromDate = resService.fromDate
            fs.toDate = resService.toDate
          }
        })

        spaServices.value.forEach(ss => {
          const resService = reservationObj.value.servicesLog.find(rs => rs.type === ss.type)
          if (resService) {
            ss.cost = parseInt(resService.cost.toString())
            ss.fromDate = resService.fromDate
            ss.toDate = resService.toDate
          }
        })
      }
    })

    const loadDates = () => {
      foodServices.value.forEach(fs => {
        if (!fs.fromDate) {
          fs.fromDate = new Date(getShortDate(reservationObj.value.fromDate as Date))
        }
        if (!fs.toDate) {
          fs.toDate = new Date(getShortDate(reservationObj.value.toDate as Date))
        }
      })

      spaServices.value.forEach(ss => {
        if (!ss.fromDate) {
          ss.fromDate = new Date(getShortDate(reservationObj.value.fromDate as Date))
        }
        if (!ss.toDate) {
          ss.toDate = new Date(getShortDate(reservationObj.value.toDate as Date))
        }
      })
    }

    watch(reservationObj, () => {
      emit('update:reservation', reservationObj)
    })

    return {
      reservationObj,
      foodServices,
      spaServices
    }
  }
})
</script>
