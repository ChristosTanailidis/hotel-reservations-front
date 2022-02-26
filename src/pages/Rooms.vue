<template>
  <div class="flex justify-center">
    <div
      style="width: 95%; margin: 15px"
      class="col-1 justify-center"
    >
      <div>
        <q-table
          title="Rooms"
          :rows="rows"
          row-key="number"
          v-model:selected="selectedRoom"
          :filter="searchText"
          v-model:pagination="paginationTable"
          @request="onRequest"
          :loading="loadingRooms"
          no-data-label="No rooms fetched"
          :rows-per-page-options="[6, 6 * 2, 6 * 3, 6 * 4, 6 * 5, 6 * 6, 0]"
          grid
          hide-header
        >
          <template #top-left>
            <q-btn
              v-if="loggedUserIsAdmin()"
              @click="addRoom()"
              icon="add"
              style="background-color: #5fe8d8; color: white; min-height: 50px"
              class="q-mb-lg"
              unelevated
            >
              add Room
            </q-btn>
          </template>

          <template #top-right>
            <q-input
              filled
              bottom-slots
              label="Search Rooms"
              v-model="searchText"
            >
              <template #append>
                <q-icon
                  v-if="searchText.length > 0"
                  name="close"
                  class="cursor-pointer"
                />
                <q-icon
                  v-else
                  name="search"
                />
              </template>
            </q-input>
          </template>

          <template #item="props">
            <div
              class="flex justify-start q-ma-md"
              :style="props.selected ? 'transform: scale(0.95);' : ''"
            >
              <div
                @click="editRoom(props.row)"
                class="cursor-pointer rounded-borders"
              >
                <RoomCard
                  style="width: 262px"
                  :room="props.row"
                  :key="props.row"
                />
              </div>
            </div>
          </template>
        </q-table>
      </div>
    </div>
    <div v-if="editRoomFlag">
      <AddEditRoomDialog
        v-model:visible="editRoomFlag"
        v-model:room="selectedRoom"
        :rooms="roomsResult"
        @refetchRooms="fetchRooms()"
      />
    </div>
    <div v-if="addRoomFlag">
      <AddEditRoomDialog
        v-model:visible="addRoomFlag"
        :room="selectedRoom"
        :rooms="roomsResult"
        @refetchRooms="fetchRooms()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'

import { useFetchRooms } from '../hooks/useRoomsQuery'
import { RoomPaginationData } from 'src/components/models/PaginatedData'

import RoomCard from '../components/simpleComponents/InfoCards/RoomCard.vue'
import AddEditRoomDialog from '../components/RoomDialog.vue'

import Room from 'src/components/models/Room'

import { useUserStore } from 'src/store/loggedUser'
import { loggedUserIsAdmin, newRoomId, notify, getRandomHexColor } from '../utils'

export default defineComponent({
  name: 'Rooms',
  components: {
    RoomCard,
    AddEditRoomDialog
  },
  setup () {
    const editRoomFlag = ref(false)
    const addRoomFlag = ref(false)

    const selectedRoom = ref<Room>()

    const paginationTable = ref({
      page: 1,
      rowsPerPage: 6,
      rowsNumber: 20
    })

    const searchText = ref('')

    const pagination = computed(():RoomPaginationData => {
      return {
        page: paginationTable.value.page,
        limit: paginationTable.value.rowsPerPage,
        filter: searchText.value
      }
    })

    const { result: roomsResult, loading: loadingRooms, total: totalRooms, fetchRooms } = useFetchRooms(pagination)
    watch(totalRooms, () => {
      paginationTable.value.rowsNumber = totalRooms.value
    })

    const rows = computed(() => roomsResult.value)

    const onRequest = (payload: {pagination: { page: number, rowsNumber: number, rowsPerPage: number }}) => {
      paginationTable.value.page = payload.pagination.page
      paginationTable.value.rowsPerPage = payload.pagination.rowsPerPage
      paginationTable.value.rowsNumber = totalRooms.value
    }

    const editRoom = (room: Room) => {
      if (!loggedUserIsAdmin()) {
        notify('role_restriction')
        return
      }

      selectedRoom.value = room
      editRoomFlag.value = true
    }

    const addRoom = () => {
      selectedRoom.value = { id: newRoomId(), number: '', capacity: 1, color: getRandomHexColor(), levelType: 1, reservations: [] } as Room
      addRoomFlag.value = true
    }

    return {
      roomsResult,
      loadingRooms,
      fetchRooms,
      pagination,
      rows,

      searchText,
      paginationTable,
      onRequest,

      editRoom,
      addRoom,
      editRoomFlag,
      addRoomFlag,
      selectedRoom,

      notify,
      useUserStore,
      loggedUserIsAdmin
    }
  }
})
</script>
