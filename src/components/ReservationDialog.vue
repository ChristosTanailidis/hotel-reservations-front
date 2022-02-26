<template>
  <div>
    <q-dialog
      v-model="dialogVisibility"
      persistent
    >
      <q-card style="min-width: 750px; padding: 15px">
        <q-form
          greedy
          @submit="submitRental()"
          @reset="closeDialog()"
        >
          <!-- SCROLL BAR AREA -->
          <q-scroll-area
            :thumb-style="thumbStyle"
            :content-style="contentStyle"
            :content-active-style="contentActiveStyle"
            style="height: 650px; "
          >
            <!-- TITLE -->
            <q-card-section>
              <q-card-actions
                align="center"
                style="padding: 0px"
              >
                <div
                  class="text-h6"
                  v-if="isNewReservation(reservationObj.id)"
                >
                  Create a reservation on room: {{ selectedRoom.number }}
                </div>
                <div
                  class="text-h6"
                  v-else-if="reservationObj.paid"
                >
                  Payed Reservation
                </div>
                <div
                  class="text-h6"
                  v-else
                >
                  Update reservation
                </div>
                <div class="absolute-top-right">
                  <q-btn
                    flat
                    dense
                    style="background-color: #728a87; color: white"
                    icon="close"
                    type="reset"
                  />
                </div>
              </q-card-actions>
            </q-card-section>

            <q-item-label
              v-if="!reservationObj.paid"
              style="margin-top: 15px; color: #8a8a8a"
            >
              Select client:
            </q-item-label>

            <!-- SEARCH IN EXISTING CLIENTS -->
            <q-card-section
              v-if="!reservationObj.paid"
              style="padding: 5px 0px 5px 0px"
            >
              <q-card-actions style="padding: 0px">
                <div
                  style="width: 100%"
                  class="flex items-center justify-center"
                >
                  <div style="width: 80%">
                    <SearchClient
                      v-model:selectedClient="reservationObj.client"
                    />
                  </div>
                  <q-btn
                    flat
                    :disable="reservationObj.paid"
                    style="margin-left: 10px; width: 18%; height: 55px; font-size: 12px; background-color: #5fe8d8; color: white"
                    @click="createUserFormVisibility = !createUserFormVisibility;"
                  >
                    <q-icon
                      name="person_add"
                      style="padding-right: 5px"
                    /> new client
                  </q-btn>
                </div>
                <q-slide-transition>
                  <CreateNewClient
                    v-model:visible="createUserFormVisibility"
                    v-model:client="reservationObj.client"
                  />
                </q-slide-transition>
              </q-card-actions>
            </q-card-section>

            <q-item-label style="margin-top: 15px; color: #8a8a8a">
              Select dates:
            </q-item-label>

            <!-- FROM-TO DATES -->
            <q-card-section style="padding: 0px">
              <q-card-actions
                align="left"
                style="padding: 0px"
              >
                <div
                  class="row no-wrap"
                  style="width: 100%"
                >
                  <div style="width: 80%">
                    <FromToDatesRange v-model:reservation="reservationObj" />
                  </div>
                  <div
                    class="q-pa-xs items-center"
                    style="width: 20%"
                  >
                    <q-input
                      v-model.number="reservationObj.people"
                      :rules="[val => val >= 0, 'Cant go less than 0']"
                      :disable="reservationObj.paid"
                      type="number"
                      label="Visitors"
                      filled
                    />
                  </div>
                </div>
              </q-card-actions>
            </q-card-section>

            <q-item-label style="margin-top: 0px; color: #8a8a8a">
              Select services:
            </q-item-label>

            <!-- SERVICES -->
            <q-card-section style="padding: 5px 0px 5px 0px">
              <q-card-actions
                class="justify-center"
                style="padding: 0px; "
              >
                <div
                  class="flex justify-center"
                  style="width: 95%"
                >
                  <FoodAndSpaServices v-model:reservation="reservationObj" />
                </div>
              </q-card-actions>
            </q-card-section>

            <q-item-label style="margin-top: 15px; color: #8a8a8a">
              Reservation Info:
            </q-item-label>

            <!-- CLIENT AND ROOM INFO -->
            <q-card-section style="padding: 5px 0px 5px 0px">
              <q-card-actions style="padding: 0px">
                <div
                  style="width: 100%"
                  class="flex justify-center"
                >
                  <!-- CLIENT INFO -->
                  <div style="min-width:230px; margin: 5px">
                    <ClientCard
                      v-if="!isNewClient(reservationObj.client.id)"
                      :client="reservationObj.client"
                    />
                    <ClientSkeleton v-else />
                  </div>
                  <!-- ROOM INFO -->
                  <div
                    :clickable="!reservationObj.paid"
                    :class="!reservationObj.paid ? 'cursor-pointer' : ''"
                    style="min-width:230px; margin: 5px"
                  >
                    <q-menu
                      v-if="!reservationObj.paid"
                      touch-position
                      style="width: 390px"
                    >
                      <q-item-label
                        align="center"
                        style="margin: 3px; margin-top: 5px; padding: 2px; background-color: #5fe8d8; color: white"
                        class="rounded-borders"
                      >
                        Quick Room Swap (Available Rooms)
                      </q-item-label>
                      <div class="flex">
                        <div
                          v-for="menuRoom in availableRoomsResult"
                          :key="menuRoom.id"
                          class="cursor-pointer"
                          clickable
                          v-close-popup
                          @click="changeRoom(menuRoom)"
                        >
                          <div style="width: 188px; margin: 3px">
                            <RoomCard
                              :room="menuRoom"
                              :key="menuRoom.id"
                            />
                          </div>
                        </div>
                      </div>
                    </q-menu>
                    <RoomCard
                      :room="reservationObj.room"
                      :key="reservationObj.room"
                      :clickable="!reservationObj.paid"
                    />
                  </div>
                </div>
              </q-card-actions>
            </q-card-section>
            <q-card-section
              style="padding: 5px 0px 5px 0px"
              v-if="!isNewReservation(reservationObj.id)"
            >
              <q-card-actions
                style="padding: 0px"
                class="flex justify-center"
              >
                <div>
                  <div class="q-pl-md q-pr-md q-mb-xs rounded-borders bg-teal-4 text-white">
                    Reservation Cost: {{ reservationObj.totalPrice.toFixed(2) }}€
                  </div>
                  <div
                    v-if="!reservationObj.paid"
                    class="q-pl-md q-pr-md rounded-borders bg-red-4 text-white"
                  >
                    Cancelation Cost: {{ cancelationCost === 0 ? ' Νo charges' : `${cancelationCost.toFixed(2)}€` }}
                  </div>
                </div>
              </q-card-actions>
            </q-card-section>
          </q-scroll-area>
          <q-card-actions class="text-primary row justify-between">
            <q-toggle
              v-if="!isNewReservation(reservationObj.id) && !reservationObj.paid"
              v-model="isClientsDecision"
              color="my-color"
              style="color: black"
              class="self-start"
              label="Changes made by client"
            />
            <div
              v-else
              style="height: 10px"
            />
            <div
              align="right"
              class="text-primary flex justify-around"
            >
              <q-btn
                flat
                class="bg-red-5 text-white q-ml-xs"
                label="Cancel"
                v-if="!isNewReservation(reservationObj.id) && !reservationObj.paid"
                :title="`Cost: ${cancelationCost === 0 ? 'no charges' : `${cancelationCost}€`}`"
                @click="cancelReservation(reservationObj.id)"
              />
              <q-btn
                flat
                class="bg-green-5 text-white q-ml-xs"
                label="Pay"
                v-if="!isNewReservation(reservationObj.id) && !reservationObj.paid"
                :title="`Cost: ${reservationObj.totalPrice}€`"
                @click="payReservation(reservationObj.id)"
              />
              <q-btn
                type="submit"
                flat
                style="background-color: #5fe8d8; color: white; min-width: 200px"
                class="q-ml-xs"
                v-if="!reservationObj.paid"
                :label="isNewReservation(reservationObj.id) ? 'Create' : 'Update'"
              />
            </div>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref, computed, watch } from 'vue'

import { useFetchRooms } from 'src/hooks/useRoomsQuery'
import { useReservationsMutation } from 'src/hooks/useReservationsMutation'
import { RoomPaginationData } from './models/PaginatedData'

import SearchClient from './simpleComponents/SearchClient.vue'
import CreateNewClient from './simpleComponents/CreateClientForm.vue'
import FromToDatesRange from './simpleComponents/FromToDateRange.vue'
import FoodAndSpaServices from './FoodAndSpaServices.vue'
import RoomCard from './simpleComponents/InfoCards/RoomCard.vue'
import ClientCard from './simpleComponents/InfoCards/ClientCard.vue'
import ClientSkeleton from './simpleComponents/Skeletons/ClientSkeleton.vue'

import User from './models/User'
import Room from './models/Room'
import Reservation, { Service } from './models/Reservation'
import ReservationInputData from './models/InputData/ReservationInputData'

import { getDaysDifference, getMilliDifference, isNewClient, isNewReservation, newClientId, newReservationId, notify } from '../utils'
import { useUserStore } from 'src/store/loggedUser'

export default defineComponent({
  name: 'CreateReservationModal',
  emits: ['update:visible', 'refetchReservations'],
  components: {
    SearchClient,
    CreateNewClient,
    FromToDatesRange,
    FoodAndSpaServices,
    ClientCard,
    ClientSkeleton,
    RoomCard
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    room: {
      type: Object as PropType<Room>,
      required: true
    },
    fromDate: {
      type: Object as PropType<Date>,
      required: true
    },
    toDate: {
      type: Object as PropType<Date>,
      required: true
    },
    reservation: {
      type: Object as PropType<Reservation>,
      required: true
    }
  },

  setup (props, { emit }) {
    const dialogVisibility = ref(props.visible)
    const createUserFormVisibility = ref(false)
    const isClientsDecision = ref(false)

    // <============ ROOMS/SELECTED_ROOM ============>
    const selectedRoom = ref(props.room) as Ref<Room>

    const roomPagination = ref({ page: 1, limit: 0, filter: '' } as RoomPaginationData)
    const { result: availableRoomsResult, fetchAvailableRooms } = useFetchRooms(roomPagination)
    onMounted(async () => {
      await fetchAvailableRooms(reservationObj.value.fromDate as Date, reservationObj.value.toDate as Date, reservationObj.value.people)
    })

    const changeRoom = (menuRoom: Room) => {
      reservationObj.value.room = menuRoom
    }

    const roomIsAvilable = async (roomToCheck: Room, startDate = reservationObj.value.fromDate as Date, endDate = reservationObj.value.toDate as Date) => {
      if (props.reservation.room && props.reservation.room.id === reservationObj.value.room.id) {
        return true
      }

      await fetchAvailableRooms(startDate, endDate, reservationObj.value.people)
      if (availableRoomsResult.value.find(ar => ar.id === roomToCheck.id)) {
        return true
      }

      return false
    }

    // <============ CLIENTS/SELECTED_CLIENT ============>
    const selectedClient = { id: newClientId(), name: '', surname: '', phone: '', email: '', reservations: [] } // null client

    // <============ USER ============>
    const selectedUser: User = {
      id: useUserStore().id,
      fullName: useUserStore().name,
      email: useUserStore().email,
      role: useUserStore().role
    } as User // null user

    // <============ RESERVATION ============>
    const reservationObj = ref<Reservation>({
      id: !isNewReservation(props.reservation.id) ? props.reservation.id : newReservationId(),
      room: !isNewReservation(props.reservation.id) ? props.reservation.room : selectedRoom.value,
      client: !isNewReservation(props.reservation.id) ? props.reservation.client : selectedClient,
      fromDate: !isNewReservation(props.reservation.id) ? new Date(props.reservation.fromDate.toString()) : new Date(props.fromDate),
      toDate: !isNewReservation(props.reservation.id) ? new Date(props.reservation.toDate.toString()) : new Date(props.toDate),
      people: !isNewReservation(props.reservation.id) ? props.reservation.people : 1,
      servicesLog: !isNewReservation(props.reservation.id) ? props.reservation.servicesLog : [],
      totalPrice: !isNewReservation(props.reservation.id) ? props.reservation.totalPrice : -1,
      paid: !isNewReservation(props.reservation.id) ? props.reservation.paid : false,
      createdDate: !isNewReservation(props.reservation.id) ? props.reservation.createdDate : new Date(),
      createdBy: !isNewReservation(props.reservation.id) ? props.reservation.createdBy : selectedUser,
      canceled: !isNewReservation(props.reservation.id) ? props.reservation.canceled : false
    })

    watch(reservationObj.value, async () => {
      await fetchAvailableRooms(reservationObj.value.fromDate as Date, reservationObj.value.toDate as Date, reservationObj.value.people)
    })

    const { addNewReservation, editReservation, cancelRes, closeRes } = useReservationsMutation()

    const submitRental = async () => {
      // <=======Validation=======>
      if (getMilliDifference(reservationObj.value.fromDate as Date, new Date()) >= 0) {
        // if user tries to create reservation before today => convert to now()
        reservationObj.value.fromDate = new Date(new Date().valueOf() + 0.5 * 60 * 1000)
        notify('warning', 'Cant travel back in time', 'From date ')
      }
      if (!await valid()) { return null }

      // Prepare reservationInputData for creation
      const reservationInputData: ReservationInputData = {
        roomId: reservationObj.value.room.id,
        clientId: reservationObj.value.client.id,

        fromDate: reservationObj.value.fromDate as Date,
        toDate: reservationObj.value.toDate as Date,
        people: reservationObj.value.people,
        servicesLog: reservationObj.value.servicesLog as Service[],
        paid: reservationObj.value.paid
      }

      if (isNewReservation(props.reservation.id)) {
        if (reservationInputData.fromDate <= new Date()) {
          reservationInputData.fromDate = new Date()
        }
        addNewReservation(reservationInputData).then((res) => {
          if (res) {
            notify('success', 'Reservation Created', `Cost: ${res.totalPrice.toFixed(2)}€`)
            emit('refetchReservations')
            closeDialog()
          } else {
            notify('error', 'Error on creation!', 'Please check your dates and all other fields.')
          }
        }).catch((err) => {
          notify('error', 'Exception in create new reservation', (err as Error).message)
          console.log(err)
        })
      } else {
        editReservation(isClientsDecision.value, reservationInputData, props.reservation.id).then((res) => {
          if (res) {
            notify('success', 'Reservation Updated', isClientsDecision.value ? `New Cost: ${res.totalPrice.toFixed(2)}` : 'No cost changes where made')
            emit('refetchReservations')
            closeDialog()
          } else {
            notify('error', 'Error on update!', 'Please check your dates and all other fields.')
          }
        }).catch((err) => {
          notify('error', 'Exception in update reservation', (err as Error).message)
          console.log(err)
        })
      }
    }

    const cancelReservation = async (reservationId: string) => {
      await cancelRes(reservationId).then(res => {
        emit('refetchReservations')
        notify('success', 'Reservation is canceled', `Cancelation cost: ${res || '0'}€`)
        closeDialog()
      })
    }

    const payReservation = async (reservationId: string) => {
      await closeRes(reservationId).then(() => {
        emit('refetchReservations')
        notify('success', 'Reservation is payed')
        closeDialog()
      })
    }

    // calculates the cost if client is about to cancel the reservation
    const cancelationCost = computed(() => {
      const days = getDaysDifference(new Date(), reservationObj.value.fromDate as Date)
      let resPrice = reservationObj.value.totalPrice
      if (days > 7) {
        resPrice = 0
      } else if (days <= 7 && days >= 2) {
        resPrice *= 0.3
      }
      return resPrice
    })

    const valid = async () => {
      const validation: { pass: boolean, msg: string }[] = []
      validation.push({ pass: !isNewClient(reservationObj.value.client.id), msg: 'No client selected' })
      validation.push({ pass: reservationObj.value.fromDate < reservationObj.value.toDate, msg: 'Reservation start date cant be newer than end date' })
      validation.push({ pass: reservationObj.value.toDate > reservationObj.value.fromDate, msg: 'Reservation end date cant be older than start date' })
      validation.push({ pass: reservationObj.value.people > 0, msg: 'No visitors are selected' })
      validation.push({ pass: reservationObj.value.people <= reservationObj.value.room.capacity, msg: 'Room capacity exided' })
      validation.push({ pass: await roomIsAvilable(reservationObj.value.room as Room), msg: 'Room isnt available at this dates' })

      const valError = validation.find(v => !v.pass)
      if (valError) {
        notify('warning', 'Invalid Data', valError.msg)
        return false
      }
      return true
    }

    // close dialog
    const closeDialog = () => {
      emit('update:visible', false)
    }

    return {
      dialogVisibility,
      closeDialog,
      createUserFormVisibility,

      changeRoom,
      roomIsAvilable,
      selectedRoom,
      availableRoomsResult,

      selectedClient,

      reservationObj,

      submitRental,
      cancelReservation,
      payReservation,
      cancelationCost,
      isClientsDecision,

      isNewReservation,
      isNewClient,

      // ccs for the scrollbar
      contentStyle: {
        backgroundColor: 'rgba(0,0,0,0)',
        color: '#555'
      },

      contentActiveStyle: {
        backgroundColor: '#eee',
        color: 'black'
      },

      thumbStyle: {
        right: '-9px',
        borderRadius: '5px',
        backgroundColor: '#57cfc1',
        width: '5px',
        opacity: 0.55
      }

    }
  }
})
</script>
