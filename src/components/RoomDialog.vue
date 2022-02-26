<template>
  <div>
    <q-dialog
      v-model="dialogVisibility"
      persistent
      style="padding: 0px"
    >
      <q-card
        style="padding: 15px; padding: 0px"
        :style="isNewRoom(selectedRoom.id) ? 'min-width: 840px' : 'min-width: 950px '"
      >
        <q-card-section
          :style="`background-color: ${selectedRoom.color}`"
          style="height: 30px"
          class="items-center"
          horizontal
        >
          <p
            style="width: 100%; color: white; text-align: center; margin: 1px"
            class="self-center"
          >
            Selected Room
          </p>
          <div class="absolute-top-right">
            <q-btn
              flat
              class="bg-grey-6 q-ma-xs "
              style="color: white"
              icon="close"
              size="10px"
              dense
              @click="closeDialog()"
            />
          </div>
        </q-card-section>

        <q-item style="background-color: #f0f0f0;">
          <q-form
            greedy
            @submit="submitRoom()"
            @reset="closeDialog()"
            style="width: 100%"
          >
            <q-scroll-area
              :thumb-style="thumbStyle"
              :content-style="contentStyle"
              :content-active-style="contentActiveStyle"
              :style="isNewRoom(selectedRoom.id) ? 'height: 140px' : 'height: 350px; '"
            >
              <div class="row justify-around">
                <q-input
                  filled
                  debounce="1000"
                  v-model="selectedRoom.number"
                  label="Room number"
                  style="margin: 4px; width: 49%"
                >
                  <template #prepend>
                    <q-icon name="bed" />
                  </template>
                </q-input>
                <q-input
                  filled
                  v-model="selectedRoom.color"
                  readonly
                  label="Color"
                  style="margin: 4px; width: 49%"
                >
                  <template #append>
                    <q-icon
                      name="colorize"
                      class="cursor-pointer"
                    >
                      <q-popup-proxy
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-color
                          v-model="selectedRoom.color"
                          no-header
                          no-footer
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template #prepend>
                    <q-icon name="palette" />
                  </template>
                </q-input>
              </div>
              <div class="row justify-between">
                <q-input
                  filled
                  v-model="selectedRoom.capacity"
                  type="number"
                  label="Capacity"
                  style="margin: 4px; width: 49%"
                >
                  <template #prepend>
                    <q-icon name="groups" />
                  </template>
                </q-input>
                <div
                  class="bg-grey-4 rounded-borders flex justify-around"
                  style="margin: 4px; width: 49%"
                >
                  <q-input
                    label="Room Level"
                    v-model="selectedRoom.levelType"
                    readonly
                    style="margin-right: 4px; width: 69%"
                  >
                    <template #prepend>
                      <q-icon name="star" />
                    </template>
                  </q-input>
                  <q-rating
                    v-model="selectedRoom.levelType"
                    size="22px"
                    :max="4"
                    no-reset
                    color="orange-3"
                    class="self-center"
                    style=" width: 25%"
                  />
                </div>
              </div>
              <div
                class="rounded-borders"
                style="height: 10px; margin: 0px 5px 0px 5px"
                :style="`background-color: ${selectedRoom.color}`"
              />
              <q-table
                v-if="!isNewRoom(room.id)"
                title="Reservations"
                dense
                flat
                hide-bottom
                :rows="reservationsRows"
                :columns="reservationsColumns"
                style="margin: 5px; width: 99%;"
                class="bg-grey-4"
                row-key="name"
              />
            </q-scroll-area>

            <q-card-actions
              align="right"
              class="text-primary flex justify-end"
            >
              <q-btn
                v-if="!isNewRoom(room.id)"
                flat
                class="bg-red-5 text-grey-2"
                label="Delete"
                @click="deleteDialogFlag = true"
              />
              <q-btn
                type="submit"
                flat
                style="background-color: #5fe8d8; color: white; min-width: 200px"
                :label="isNewRoom(selectedRoom.id) ? 'Add Room' : 'Edit Room'"
              />
            </q-card-actions>
          </q-form>
        </q-item>
      </q-card>
      <div v-if="deleteDialogFlag">
        <RemoveItemPrompt
          v-model:visible="deleteDialogFlag"
          :type-of-item="'room'"
          :item-to-remove="selectedRoom"
          @closeDialog="closeDialog()"
        />
      </div>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue'

import { useRoomsMutation } from 'src/hooks/useRoomsMutation'
import { useFetchRooms } from 'src/hooks/useRoomsQuery'

import RemoveItemPrompt from 'src/components/simpleComponents/RemoveItemPrompt.vue'

import Reservation from './models/Reservation'
import Room from './models/Room'
import RoomInputData from './models/InputData/RoomInputData'

import { getDaysDifference, getShortDate, isNewRoom, notify } from 'src/utils'

export default defineComponent({
  name: 'EditRoomDialog',
  emits: ['update:visible', 'refetchRooms', 'update:room', 'closeDialog'],
  components: {
    RemoveItemPrompt
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
    rooms: {
      type: Object as PropType<Room[]>,
      required: true
    }
  },

  setup (props, { emit }) {
    const dialogVisibility = ref<boolean>(props.visible)
    const deleteDialogFlag = ref<boolean>(false)
    const selectedRoom = ref<Room>(props.room)

    const { addRoom, editRoom } = useRoomsMutation()

    const submitRoom = async () => {
      if (!await valid()) { return null }

      // Prepare roomInputData for creation
      const roomInputData: RoomInputData = {
        capacity: parseInt(selectedRoom.value.capacity.toString()),
        number: selectedRoom.value.number,
        levelType: parseInt(selectedRoom.value.levelType.toString()),
        color: selectedRoom.value.color
      }

      if (isNewRoom(selectedRoom.value.id)) { // adding room
        addRoom(roomInputData).then((res) => {
          if (res) {
            notify('success', 'Room Added')
            emit('refetchRooms')
            emit('closeDialog')
            closeDialog()
          } else {
            notify('error', 'Error on create!', 'Please check your fields.')
          }
        }).catch((err) => {
          notify('error', 'Exception in create room', (err as Error).message)
          console.log(err)
        })
      } else { // editing room
        editRoom(roomInputData, selectedRoom.value.id).then((res) => {
          if (res) {
            notify('success', 'Room Updated')
            closeDialog()
          } else {
            notify('error', 'Error on update!', 'Please check your fields.')
          }
        }).catch((err) => {
          notify('error', 'Exception in update room', (err as Error).message)
          console.log(err)
        })
      }
    }

    const valid = async () => {
      const validation: {pass: boolean, msg: string}[] = []

      const numberExists = await roomNumberExists(selectedRoom.value.number, selectedRoom.value.id)

      validation.push({ pass: !numberExists && !loading.value, msg: 'Room number already exists' })
      validation.push({ pass: selectedRoom.value.number.length >= 3, msg: 'Room number must have 3 or more characters' })
      validation.push({ pass: selectedRoom.value.levelType >= 1, msg: 'Room level cant be less than 1' })
      validation.push({ pass: selectedRoom.value.levelType <= 4, msg: 'Room level cant be more than 4' })
      validation.push({ pass: selectedRoom.value.capacity >= 1, msg: 'Room capacity cant be less than 1' })

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
      emit('refetchRooms')
    }

    // reservations of room
    const reservationsRows = computed(() => {
      const temp = [] as Reservation[]
      selectedRoom.value.reservations.forEach(r => {
        if (getDaysDifference(new Date(r.createdDate.toString()), new Date()) < 30) {
          temp.push(r as Reservation)
        }
      })
      return temp
    })

    // column names
    const reservationsColumns = [
      { name: 'client', label: 'Client', align: 'left', sortable: true, field: (row: Reservation) => `${row.client.name} ${row.client.surname}` },
      { name: 'fromDate', label: 'Start Date', align: 'left', sortable: true, field: (row: Reservation) => getShortDate(new Date(row.fromDate)) },
      { name: 'toDate', label: 'End Date', align: 'left', sortable: true, field: (row: Reservation) => getShortDate(new Date(row.toDate)) },
      { name: 'people', label: 'Visitors', align: 'left', sortable: true, field: (row: Reservation) => row.people },
      { name: 'totalPrice', label: 'Price', align: 'left', sortable: true, field: (row: Reservation) => row.totalPrice },
      { name: 'createdDate', label: 'Reservation Date', align: 'left', sortable: true, field: (row: Reservation) => getShortDate(new Date(row.createdDate)) },
      { name: 'createdBy', label: 'Created By', align: 'left', sortable: true, field: (row: Reservation) => row.createdBy.fullName }
    ]

    // room name validation on typing with debounce
    const pagination = ref({ page: 1, limit: 0, filter: '' })
    const { loading, roomNumberExists } = useFetchRooms(pagination)

    watch(selectedRoom.value, async () => {
      if (await roomNumberExists(selectedRoom.value.number, selectedRoom.value.id)) {
        // eslint-disable-next-line no-useless-escape
        notify('warning', `Room number \"${selectedRoom.value.number}\" already exists`)
      }
    })

    return {
      dialogVisibility,
      closeDialog,
      deleteDialogFlag,

      selectedRoom,
      reservationsRows,
      reservationsColumns,

      submitRoom,

      isNewRoom,

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
