<template>
  <div class="flex justify-around items-center">
    <q-btn
      flat
      icon="edit_calendar"
      class="text-black bg-grey-4"
    >
      <div style="margin-left: 10px">
        <q-chip
          class="text-black bg-grey-5"
          style="font-size: 12px"
          v-if="dateRange"
        >
          {{ dateRange.from }}
        </q-chip>
        -
        <q-chip
          class="text-black bg-grey-5"
          style="font-size: 12px"
          v-if="dateRange"
        >
          {{ dateRange.to }}
        </q-chip>
      </div>
      <q-popup-proxy
        transition-show="scale"
        transition-hide="scale"
      >
        <q-date
          v-model="dateRange"
          :options="availableDates"
          range
        >
          <div class="row items-center justify-end">
            <q-btn
              v-close-popup
              label="Close"
              color="primary"
              flat
            />
          </div>
        </q-date>
      </q-popup-proxy>
    </q-btn>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue'

import Reservation from 'src/components/models/Reservation'

import { getShortDate, notify } from 'src/utils'

export default defineComponent({
  name: 'ServiceDateRange',
  emits: ['update:reservation'],
  props: {
    reservation: {
      type: Object as PropType<Reservation>,
      required: true
    },
    serviceType: {
      type: String,
      required: true
    }
  },
  setup (props, { emit }) {
    const reservationObj = ref(props.reservation)

    const typeIndex = computed(() => {
      if (props.reservation) {
        return reservationObj.value.servicesLog.findIndex(rs => rs.type === props.serviceType)
      }
      return -1
    })

    const service = ref(reservationObj.value.servicesLog[typeIndex.value])

    const fromDateFormated = ref(service.value ? getShortDate(service.value.fromDate as Date) : getShortDate(reservationObj.value.fromDate as Date))
    const fromRangeOption = computed(() => getShortDate(reservationObj.value.fromDate as Date))

    const toDateFormated = ref(service.value ? getShortDate(service.value.toDate as Date) : getShortDate(reservationObj.value.toDate as Date))
    const toRangeOption = computed(() => getShortDate(reservationObj.value.toDate as Date))

    const dateRange = ref<{from: string, to: string}>({ from: fromDateFormated.value, to: toDateFormated.value })

    watch(dateRange, () => {
      setTimeout(() => {
        if (!dateRange.value) {
          // no selection is made notify with delay
          notify('warning', 'Date range', 'Please set a range of dates on this service')
        } else {
          if (!dateRange.value.from || !dateRange.value.to) {
            // single day service
            dateRange.value = { from: String(dateRange.value), to: String(dateRange.value) }
            notify('success', 'One Day Service', 'You\'ve selected a service for one day')
          }
          reservationObj.value.servicesLog[typeIndex.value].fromDate = new Date(dateRange.value.from)
          reservationObj.value.servicesLog[typeIndex.value].toDate = new Date(dateRange.value.to)
          emit('update:reservation', reservationObj)
        }
      }, 2000)
    })

    return {
      reservationObj,
      dateRange,

      // dates range restriction
      availableDates (date: string) {
        return date >= fromRangeOption.value && date <= toRangeOption.value
      }
    }
  }
})
</script>
