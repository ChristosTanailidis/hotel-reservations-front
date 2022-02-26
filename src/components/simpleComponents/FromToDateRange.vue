<template>
  <div
    class="flex justify-around"
    style="width: 100%"
  >
    <div
      v-if="reservationObj.fromDate"
      class="q-pa-xs"
      style="max-width: 50%"
    >
      <q-input
        label="From"
        filled
        v-model="fromFormated"
        readonly
        :disable="reservationObj.paid"
        :rules="[
          () => fromD !== null || 'Please fill the date',
          () => fromT !== null || 'Please fill the time',
          () => fromFormated < toFormated || `Date must be before ${toFormated}`
        ]"
      >
        <template #prepend>
          <q-icon
            name="event"
            class="cursor-pointer"
          >
            <q-popup-proxy
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="fromD"
                mask="YYYY/MM/DD"
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
          </q-icon>
        </template>

        <template #append>
          <q-icon
            name="access_time"
            class="cursor-pointer"
          >
            <q-popup-proxy
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time
                v-model="fromT"
                mask="HH:mm"
                format24h
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Close"
                    color="primary"
                    flat
                  />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div
      v-if="reservationObj.toDate"
      class="q-pa-xs"
      style="max-width: 50%"
    >
      <q-input
        label="To"
        filled
        v-model="toFormated"
        readonly
        :disable="reservationObj.paid"
        :rules="[
          () => toD !== null || 'Please fill the date',
          () => toT !== null || 'Please fill the time',
          () => toFormated > fromFormated || `Date must be after ${fromFormated}`
        ]"
      >
        <template #prepend>
          <q-icon
            name="event"
            class="cursor-pointer"
          >
            <q-popup-proxy
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="toD"
                mask="YYYY/MM/DD"
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
          </q-icon>
        </template>

        <template #append>
          <q-icon
            name="access_time"
            class="cursor-pointer"
          >
            <q-popup-proxy
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time
                v-model="toT"
                mask="HH:mm"
                format24h
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Close"
                    color="primary"
                    flat
                  />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue'

import Reservation from 'src/components/models/Reservation'

import { getMilliDifference, getShortDate, getShortTime, notify } from 'src/utils'

export default defineComponent({
  name: 'FromToDateRange',
  emits: ['update:reservation'],
  props: {
    reservation: {
      type: Object as PropType<Reservation>,
      required: true
    }
  },
  setup (props, { emit }) {
    const reservationObj = ref(props.reservation)

    // from dates
    const fromD = ref(getShortDate(reservationObj.value.fromDate as Date)) // get only the date as YYYY/MM/DD
    const fromT = ref(getShortTime(reservationObj.value.fromDate as Date)) // get only the time as HH:SS
    const fromFormated = computed(() => `${fromD.value} ${fromT.value}`) // format both YYYY/MM/DD HH:SS

    // to date
    const toD = ref(getShortDate(reservationObj.value.toDate as Date))
    const toT = ref(getShortTime(reservationObj.value.toDate as Date))
    const toFormated = computed(() => `${toD.value} ${toT.value}`)

    watch(fromFormated, () => {
      if (!valid()) { return }

      reservationObj.value.fromDate = new Date(fromFormated.value)
      reservationObj.value.servicesLog.forEach(s => { s.fromDate = reservationObj.value.fromDate })
      emit('update:reservation', reservationObj)
    })

    watch(toFormated, () => {
      if (!valid()) { return }

      reservationObj.value.toDate = new Date(toFormated.value)
      reservationObj.value.servicesLog.forEach(s => { s.toDate = reservationObj.value.toDate })
      emit('update:reservation', reservationObj)
    })

    const valid = () => {
      const validation: { pass: boolean, msg: string }[] = []
      validation.push({ pass: getMilliDifference(new Date(fromFormated.value), new Date(toFormated.value)) > 0, msg: 'From-date cant be greater than to-date' })

      const valError = validation.find(v => !v.pass)
      if (valError) {
        notify('warning', 'Invalid Data', valError.msg)
        return false
      }
      return true
    }

    return {
      reservationObj,

      fromD,
      fromT,
      fromFormated,

      toD,
      toT,
      toFormated
    }
  }
})
</script>
