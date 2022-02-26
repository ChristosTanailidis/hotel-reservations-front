<template>
  <div v-if="roomsResult || reservationsResult">
    <FullCalendar
      style="padding: 0px 10px 0px 10px; width: 100%"
      :options="calendarOptions"
    />
  </div>

  <div v-if="reservationDialogVisibility">
    <AddEditReservationDialog
      v-model:visible="reservationDialogVisibility"
      :room="room"
      :from-date="fromDate"
      :to-date="toDate"
      :reservation="reservation"
      @refetchReservations="fetchReservations"
    />
  </div>

  <div v-if="addRoomDialogFlag">
    <AddEditRoomDialog
      v-model:visible="addRoomDialogFlag"
      v-model:room="room"
      :rooms="roomsResult"
      @refetchRooms="fetchRooms"
    />
  </div>

  <!-- todo: make this a component -->
  <q-toggle
    v-model="isClientsDecision"
    label="Changes made by client"
  />

  <div>
    <!-- todo: make this a simple component -->
    <q-dialog
      v-model="searchRoomDialogFlag"
      seamless
      position="top"
    >
      <q-card style="width: 750px">
        <q-card-section class="row items-center no-wrap">
          <div class="col justify-center">
            <div>
              <q-input
                v-model="searchText"
                autofocus
                placeholder="search based on room name, level and capacity"
                style="margin: 4px; width: 98.2%"
                @keypress.enter="searchRoomDialogFlag = false"
              >
                <template #append>
                  <q-icon name="search" />
                </template>
                <template #prepend>
                  <q-icon name="bed" />
                </template>
              </q-input>
            </div>
            <div>
              <q-expansion-item
                class="rounded-borders bg-grey-3 q-mt-sm"
                label="Search Available Rooms (by date)"
                dense
              >
                <div class="flex justify-around bg-grey-2 q-pa-sm rounded-borders ">
                  <q-btn
                    flat
                    icon="edit_calendar"
                    class="text-black bg-grey-4"
                  >
                    <div style="margin-left: 10px">
                      <q-chip
                        class="text-black bg-grey-5"
                        style="font-size: 12px"
                        square
                        v-if="availableRoomsOptions.dateRange"
                      >
                        {{ availableRoomsOptions.dateRange.from }}
                      </q-chip>
                      -
                      <q-chip
                        class="text-black bg-grey-5"
                        style="font-size: 12px"
                        square
                        v-if="availableRoomsOptions.dateRange"
                      >
                        {{ availableRoomsOptions.dateRange.to }}
                      </q-chip>
                    </div>
                    <q-popup-proxy
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="availableRoomsOptions.dateRange"
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
                  <div class="flex bg-grey-4 rounded-borders q-pr-md">
                    <q-icon
                      name="group"
                      class="q-pa-sm"
                      size="30px"
                    />
                    <q-input
                      type="number"
                      v-model="availableRoomsOptions.people"
                      label="Minimum Room Capacity"
                      dense
                    />
                  </div>
                </div>
              </q-expansion-item>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import FullCalendar, { CalendarOptions, DateSelectArg } from '@fullcalendar/vue3'
import interactionPlugin from '@fullcalendar/interaction'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'

import AddEditReservationDialog from '../components/ReservationDialog.vue'
import AddEditRoomDialog from '../components/RoomDialog.vue'

import { useFetchRooms } from '../hooks/useRoomsQuery'
import { useFetchReservations } from '../hooks/useReservationsQuery'
import { useReservationsMutation } from 'src/hooks/useReservationsMutation'
import { RoomPaginationData, ReservationPaginationData } from 'src/components/models/PaginatedData'

import Room from '../components/models/Room'
import Reservation from 'src/components/models/Reservation'
import ReservationInputData from 'src/components/models/InputData/ReservationInputData'

import { getShortDate, getShortTime, loggedUserIsAdmin, newReservationId, newRoomId, notify, getRandomHexColor } from '../utils'
import moment from 'moment'

export default defineComponent({
  name: 'ReservationCalendar',
  components: {
    FullCalendar,
    AddEditReservationDialog,
    AddEditRoomDialog
  },
  setup () {
    const reservationDialogVisibility = ref(false)

    const addRoomDialogFlag = ref(false)
    const searchRoomDialogFlag = ref(false)

    const isClientsDecision = ref(false)

    const fromDate = ref(new Date())
    const toDate = ref(new Date())

    const searchText = ref('')

    const roomPagination = computed(() => {
      return { page: 1, limit: 0, filter: searchText.value } as RoomPaginationData
    })
    const { result: roomsResult, fetchRooms, fetchAvailableRooms } = useFetchRooms(roomPagination)

    const roomResources = computed(() => {
      const temp = [] as {id:string, title: string, level: string, capacity: number}[]

      roomsResult.value.forEach(r => {
        const roomTemp = r as Room
        temp.push({ id: roomTemp.id, title: roomTemp.number, level: `level: ${roomTemp.levelType}`, capacity: roomTemp.capacity })
      })

      return temp
    })

    const reservationPagination = ref({ page: 1, limit: 0, filter: '' } as ReservationPaginationData)
    const { result: reservationsResult, fetchReservations } = useFetchReservations(reservationPagination)

    const reservationEvents = computed(() => {
      const temp = [] as {id:string, resourceId: string, title: string, start: string, end: string, color: string, borderColor?: string}[]
      reservationsResult.value.forEach(r => {
        if (!r.canceled) {
          const reservationTemp = r as Reservation

          const resourceId = reservationTemp.room ? reservationTemp.room.id : 'no_id'
          const eventTitle = `${reservationTemp.paid ? '(Payed)' : ''} ${reservationTemp.client.name} ${reservationTemp.client.surname}`
          const startDate = `${getShortDate(new Date(reservationTemp.fromDate), '-')} ${getShortTime(new Date(reservationTemp.fromDate))}`
          const endDate = `${getShortDate(new Date(reservationTemp.toDate), '-')} ${getShortTime(new Date(reservationTemp.toDate))}`
          const color = reservationTemp.room.color

          if (reservationTemp.paid) {
            temp.push({ id: reservationTemp.id, resourceId, title: eventTitle, start: startDate, end: endDate, color, borderColor: 'green' })
          } else {
            temp.push({ id: reservationTemp.id, resourceId, title: eventTitle, start: startDate, end: endDate, color })
          }
        }
      })

      return temp
    })

    const room = ref<Room>({
      id: newRoomId(),
      number: '',
      capacity: 0,
      color: getRandomHexColor(),
      levelType: 0,
      reservations: []
    })

    const reservation = ref<Reservation>()

    const calendarOptions = computed(() => {
      const temp = {
        plugins: [resourceTimelinePlugin, interactionPlugin],
        resourceAreaHeaderContent: 'Rooms',
        initialView: 'resourceTimelineYear',

        resources: roomResources.value,
        resourceOrder: 'level, capacity',
        resourceGroupField: 'level',
        resourceAreaWidth: '180px',
        resourceAreaColumns: [
          {
            field: 'title',
            headerContent: 'Room'
          },
          {
            field: 'capacity',
            headerContent: 'Capacity'
          }
        ],

        events: reservationEvents.value, // reservations
        eventStartEditable: true, // move column (days)
        eventDurationEditable: true, // resize duration
        eventResourceEditable: true,
        droppable: true, // end of drag
        eventOverlap: false,
        eventDrop: async function (eventDropInfo) {
          const reservationIndex = reservationsResult.value.findIndex(r => (r as Reservation).id === eventDropInfo.event.id)
          if (eventDropInfo.oldResource?.extendedProps.level > eventDropInfo.newResource?.extendedProps.level && !isClientsDecision.value) {
            notify('warning', 'Reservation cant be downgraded without clients permision')
          } else if (eventDropInfo.oldResource?.extendedProps.capacity > eventDropInfo.newResource?.extendedProps.capacity) {
            notify('warning', 'Room capacity exided with this reservation')
          } else if (reservationIndex >= 0) {
            const resObj = reservationsResult.value[reservationIndex] as Reservation
            const reservationInputData: ReservationInputData = {
              roomId: eventDropInfo.event._def.resourceIds ? eventDropInfo.event._def.resourceIds[0] : '',
              clientId: resObj.client.id,
              fromDate: new Date(eventDropInfo.event.startStr),
              toDate: new Date(eventDropInfo.event.endStr),
              people: resObj.people,
              servicesLog: resObj.servicesLog,
              paid: resObj.paid
            }
            updateReservation(reservationInputData, eventDropInfo.event.id, isClientsDecision.value)
          }
          await fetchReservations()
        },
        eventResize: async function (eventDropInfo) {
          const reservationIndex = reservationsResult.value.findIndex(r => (r as Reservation).id === eventDropInfo.event.id)
          if (reservationIndex >= 0) {
            const resObj = reservationsResult.value[reservationIndex] as Reservation
            const reservationInputData: ReservationInputData = {
              roomId: eventDropInfo.event._def.resourceIds ? eventDropInfo.event._def.resourceIds[0] : '',
              clientId: resObj.client.id,
              fromDate: new Date(eventDropInfo.event.startStr),
              toDate: new Date(eventDropInfo.event.endStr),
              people: resObj.people,
              servicesLog: resObj.servicesLog,
              paid: resObj.paid
            }
            updateReservation(reservationInputData, eventDropInfo.event.id, isClientsDecision.value)
          }
          await fetchReservations()
        },
        eventClick: function (eventClickInfo) {
          const reservations = reservationsResult.value as Reservation[]
          reservation.value = reservations.find(r => r.id === eventClickInfo.event._def.publicId)

          const rooms = roomsResult.value as Room[]
          const roomId = eventClickInfo.event._def.resourceIds ? eventClickInfo.event._def.resourceIds[0] : ''
          const foundRoom = rooms.find(r => r.id === roomId)
          if (foundRoom) {
            room.value = foundRoom
          }

          reservationDialogVisibility.value = true
        },

        customButtons: {
          addRoomButton: {
            text: '+ Add Room',
            icon: '',
            click: function () {
              room.value = {
                id: newRoomId(),
                number: '',
                capacity: 0,
                color: getRandomHexColor(),
                levelType: 0,
                reservations: []
              }
              addRoomDialogFlag.value = true
            }
          },
          searchRooms: {
            text: 'Search Rooms',
            click: function () {
              searchRoomDialogFlag.value = !searchRoomDialogFlag.value
            }
          }
        },

        headerToolbar: {
          left: `${loggedUserIsAdmin() ? 'addRoomButton ' : ''}searchRooms`,
          center: 'title'
        },

        slotLabelFormat: [
          { month: 'long', year: 'numeric' }, // top level of text
          { weekday: 'short', day: '2-digit' } // lower level of text
        ],
        slotDuration: '24:00:00', // each cell means 24 hours

        scrollTime: `${24 * moment().dayOfYear() - 23}:00:00`, // scrolls to today date
        nowIndicator: true, // red indicator for today

        height: '84vh',
        selectable: true, // enables selectable cells
        selectOverlap: false, // disable selection on events

        select: (selectionInfo: DateSelectArg) => {
          // sets reservation starting date
          fromDate.value = selectionInfo.start
          fromDate.value.setMonth(fromDate.value.getMonth())
          fromDate.value.setHours(14, 0, 0) // check-in time 14:00

          // sets reservation ending date
          toDate.value = selectionInfo.end
          toDate.value.setMonth(toDate.value.getMonth())
          toDate.value.setDate(toDate.value.getDate() - 1)
          toDate.value.setHours(11, 0, 0) // check-out time 11:00

          // sets the room
          room.value = roomsResult.value.find(r => (r as Room).id === selectionInfo.resource?._resource.id ? selectionInfo.resource?._resource.id : '') as Room

          reservation.value = { id: newReservationId() } as Reservation

          reservationDialogVisibility.value = true // opens create reservation modal
        }
      } as CalendarOptions
      return temp
    })

    const { editReservation } = useReservationsMutation()

    const updateReservation = (data: ReservationInputData, id: string, isClientsDecision = false) => {
      editReservation(isClientsDecision, data, id).then(async (res) => {
        if (res) {
          notify('success', 'Reservation Updated', isClientsDecision ? `Cost changes where made ${res.totalPrice.toFixed(2)}€` : 'No cost changes where made')
          await fetchRooms().then(async () => await fetchReservations())
        } else {
          notify('error', 'Error on update!')
        }
      }).catch((err) => {
        notify('error', 'Exception in update new reservation', (err as Error).message)
        console.log(err)
      })
    }

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const availableRoomsOptions = ref<{dateRange: {from: string, to: string}, people: number}>({ dateRange: { from: getShortDate(today), to: getShortDate(tomorrow) }, people: 1 })

    watch(availableRoomsOptions.value, async () => {
      if (availableRoomsOptions.value.people <= 0) {
        notify('warning', 'Room capacity cant be less than 0')
        availableRoomsOptions.value.people = 1
      }
      await fetchAvailableRooms(new Date(availableRoomsOptions.value.dateRange.to), new Date(availableRoomsOptions.value.dateRange.from), parseInt(availableRoomsOptions.value.people.toString()))
    })

    return {
      reservationDialogVisibility,
      reservation,
      reservationsResult,
      fetchReservations,

      isClientsDecision,

      addRoomDialogFlag,
      searchRoomDialogFlag,
      roomsResult,
      searchText,
      fetchRooms,
      room,

      fromDate,
      toDate,

      availableRoomsOptions,
      calendarOptions,

      // dates range restriction
      availableDates (date: string) {
        return date >= getShortDate(new Date())
      }

    }
  }
})
</script>
