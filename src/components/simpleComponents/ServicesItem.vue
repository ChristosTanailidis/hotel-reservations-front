<template>
  <q-expansion-item
    expand-icon="null"
    style="width: 100%; margin: 5px"
    class="rounded-borders bg-grey-3"
  >
    <template #header>
      <div
        class="flex items-center rounded-borders"
        style="font-size: 20px"
        :class="selectedServices.length > 0 ? 'text-green-6' : ''"
      >
        <q-icon :name="serviceOptions.icon" />
        <q-item-label style="margin-left: 5px">
          {{ serviceOptions.name }}
        </q-item-label>
        <q-chip
          v-if="selectedServices.length > 0 "
          class="text-caption text-white bg-green-6"
          style="margin-left: 10px"
        >
          +{{ selectedServices.length >= 4 ? 1 : selectedServices.length }}
        </q-chip>
        <q-chip
          v-if="selectedServices.length > 0 "
          class="text-caption text-white bg-green-6"
          style="margin-left: 10px"
        >
          {{ totalCost }}€
        </q-chip>
      </div>
    </template>

    <div
      class="bg-grey-1 column rounded-borders text-black "
      style="margin: 5px "
    >
      <div
        v-for="service in servicesList"
        :key="service.type"
        class="row items-center justify-between rounded-borders bg-grey-2"
        style="margin: 2px; height: 50px"
      >
        <div
          class="row items-center no-wrap justify-between"
          style="width: 50%"
        >
          <div
            class="row items-center justify-between"
            style="width: 72%"
          >
            <q-checkbox
              v-if="service != servicesList[servicesList.length - 1]"
              :disable="fullPackageIsSelected() || reservationObj.paid"
              :selected="isSelected(service)"
              :label="service.type"
              :val="service"
              @click="addOrRemoveService(service)"
              v-model="selectedServices"
              color="teal"
            />
            <q-checkbox
              v-else
              @click="selectFullPackage(); addOrRemoveService(service)"
              :disable="reservationObj.paid"
              :label="service.type"
              :val="service"
              v-model="selectedServices"
              color="teal"
            />
            <q-item-label
              v-if="isSelected(service)"
              style="font-size: 13px"
            >
              {{ `(${calculateDaysOfService(service.type)}` }} {{ calculateDaysOfService(service.type) > 1 ? ` days)` : ` day)` }}
            </q-item-label>
          </div>

          <q-chip style="font-size: 12px">
            {{ service.cost }}€/day
          </q-chip>
        </div>
        <div style="width: 50%">
          <transition name="fade">
            <div
              v-if="isSelected(service)"
              style="margin-left: 15px;"
              class="flex justify-between items-center"
            >
              <q-chip
                class="bg-green-6 text-white"
                style="font-size: 12px"
              >
                {{ service.cost * calculateDaysOfService(service.type) }}€
              </q-chip>
              <ServiceDateRange
                v-model:reservation="reservationObj"
                :service-type="service.type"
              />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </q-expansion-item>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch, onMounted } from 'vue'

import ServiceDateRange from 'src/components/simpleComponents/ServiceDateRange.vue'

import Reservation, { Service } from 'src/components/models/Reservation'

import { getDaysDifference } from 'src/utils'

export default defineComponent({
  name: 'ServicesItem',
  emits: ['update:reservation'],
  components: {
    ServiceDateRange
  },
  props: {
    reservation: {
      type: Object as PropType<Reservation>,
      required: true
    },
    services: {
      type: [Object] as PropType<Service[]>,
      required: true
    }
  },
  setup (props, { emit }) {
    const servicesList = ref<Service[]>(props.services) // all services (food or spa)
    const selectedServices = ref<Service[]>([]) // all selected services from checkboxes (v-modeled)
    const reservationObj = ref<Reservation>(props.reservation)

    onMounted(() => {
      servicesList.value.forEach(sl => {
        if (sl.cost === 0) {
          selectedServices.value.push(sl)
        }
      })
    })

    // loads the selected services when props are loaded
    watch(props.services, () => {
      if (props.services.length > 0) {
        const temp = [] as Service[]
        props.services.forEach(sl => {
          const found = props.reservation.servicesLog.find(rs => rs.type === sl.type)
          if (found) {
            temp.push(sl)
          }
        })
        selectedServices.value = temp
      }
    })

    // predefined data based on type of service (0: is food, 1: is spa)
    const serviceOptions = computed(() => {
      const options = { id: -1, icon: 'do_not_disturb', name: 'UNKNOWN' }
      const isFood = servicesList.value.find((s) => s.type === 'Breakfast' || s.type === 'Dinner' || s.type === 'Lunch')
      const isSpa = servicesList.value.find((s) => s.type === 'Pool' || s.type === 'Massage' || s.type === 'Spa')

      if (isFood) {
        options.id = 0 // food
        options.icon = 'restaurant'
        options.name = 'Food Services'
      } else if (isSpa) {
        options.id = 1 // spa
        options.icon = 'spa'
        options.name = 'Spa Services'
      }
      return options
    })

    const addOrRemoveService = (service: Service) => {
      if (isSelected(service)) {
        if (!isRegistered(service)) {
          // add service
          reservationObj.value.servicesLog.push(service)
        }
      } else {
        if (isRegistered(service)) {
          // remove (already exists)
          const indexToRemove = reservationObj.value.servicesLog.findIndex(rs => rs.type === service.type)
          reservationObj.value.servicesLog.splice(indexToRemove, 1)
        }
      }
      emit('update:reservation', reservationObj)
    }

    // checks if given service exists on the selectedServices list
    const isSelected = (service: Service) => {
      return !!selectedServices.value.find(rs => rs.type === service.type)
    }

    // checks if given service is registered on the reservationObj.serviceLog
    const isRegistered = (service: Service) => {
      return !!reservationObj.value.servicesLog.find(rs => rs.type === service.type)
    }

    // checks if fullPackage is selected
    const fullPackageIsSelected = () => {
      return !!selectedServices.value.find(ss => ss.type === servicesList.value[servicesList.value.length - 1].type)
    }

    // when full package is selected disable all other services and keep only the full package
    const selectFullPackage = () => {
      if (fullPackageIsSelected()) {
        selectedServices.value = []
        selectedServices.value.push(servicesList.value[servicesList.value.length - 1])

        servicesList.value.forEach(slItem => {
          if (slItem.type !== servicesList.value[servicesList.value.length - 1].type) {
            if (reservationObj.value.servicesLog.find(rs => rs.type === slItem.type)) {
              addOrRemoveService(reservationObj.value.servicesLog.find(rs => rs.type === slItem.type) as Service)
            }
          }
        })
      } else {
        selectedServices.value = []

        servicesList.value.forEach(slItem => {
          if (reservationObj.value.servicesLog.find(rs => rs.type === slItem.type)) {
            addOrRemoveService(reservationObj.value.servicesLog.find(rs => rs.type === slItem.type) as Service)
          }
        })
      }
    }

    // returns the days of each service (ui information)
    const calculateDaysOfService = (serviceType: string) => {
      const index = selectedServices.value ? selectedServices.value.findIndex((service) => (service as Service).type === serviceType) : -1
      if (index >= 0) {
        return getDaysDifference(selectedServices.value[index].fromDate as Date, selectedServices.value[index].toDate as Date)
      }
      return -1
    }

    // calculates the service package cost
    const totalCost = computed(() => {
      let total = 0
      selectedServices.value.forEach((s) => {
        total += s.cost * getDaysDifference(s.fromDate as Date, s.toDate as Date)
      })
      return total
    })

    return {
      reservationObj,

      serviceOptions,
      servicesList,
      selectedServices,
      addOrRemoveService,

      isSelected,
      fullPackageIsSelected,
      selectFullPackage,
      calculateDaysOfService,
      totalCost
    }
  }
})
</script>
