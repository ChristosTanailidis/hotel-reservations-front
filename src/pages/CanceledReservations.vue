<template>
  <div class="flex justify-center q-pt-md">
    <div class="rounded-borders bg-grey-2 q-pa-md">
      <div class="row">
        <q-input
          filled
          bottom-slots
          label="Search Canceled Reservations"
          v-model="searchText"
          style="width: 100%"
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
      </div>
      <div class="row">
        <q-table
          dense
          :loading="loadingReservations"
          title="Canceled Reservations"
          :columns="columns"
          :rows="rows"
          no-data-label="No reservations fetched"
          row-key="id"
          v-model:pagination="paginationTable"
          @request="onRequest"
          style="width: 1000px"
        >
          <template #header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template #body="props">
            <q-tr :props="props">
              <q-td
                key="room"
                :props="props"
              >
                {{ props.row.room.number }}
              </q-td>
              <q-td
                key="client"
                :props="props"
              >
                {{ props.row.client.name }} {{ props.row.client.surname }}
              </q-td>
              <q-td
                key="people"
                :props="props"
              >
                {{ props.row.people }}
              </q-td>
              <q-td
                key="fromDate"
                :props="props"
              >
                {{ getShortDate(props.row.fromDate) }}
              </q-td>
              <q-td
                key="toDate"
                :props="props"
              >
                {{ getShortDate(props.row.toDate) }}
              </q-td>
              <q-td
                key="cost"
                :props="props"
              >
                {{ props.row.totalPrice }}€
              </q-td>
              <q-td
                key="createdDate"
                :props="props"
              >
                {{ getShortDate(props.row.createdDate) }}
              </q-td>
              <q-td
                key="createdBy"
                :props="props"
              >
                <q-chip dense>
                  <q-icon
                    v-if="props.row.createdBy.role.toLowerCase() === 'admin'"
                    name="admin_panel_settings"
                    size="20px"
                  />
                  <q-icon
                    v-else-if="props.row.createdBy.role.toLowerCase() === 'manager'"
                    name="support_agent"
                    size="20px"
                  />
                  <q-icon
                    v-else
                    name="info"
                    size="20px"
                  />
                  {{ props.row.createdBy.fullName }}
                </q-chip>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'

import { useFetchReservations } from 'src/hooks/useReservationsQuery'
import { ReservationPaginationData } from 'src/components/models/PaginatedData'

import { useUserStore } from 'src/store/loggedUser'
import { loggedUserIsAdmin, loggedUserIsManager, notify, getShortDate } from 'src/utils'
import Reservation from 'src/components/models/Reservation'

export default defineComponent({
  name: 'CanceledReservtions',
  setup () {
    const columns = [
      { name: 'room', align: 'left', label: 'Room', field: 'room' },
      { name: 'client', align: 'left', label: 'Client', field: (row: Reservation) => `${row.client.name} ${row.client.surname}` },
      { name: 'people', align: 'center', label: 'Visitors', field: 'people' },
      { name: 'fromDate', align: 'center', label: 'Start', field: 'fromDate' },
      { name: 'toDate', align: 'center', label: 'End', field: 'toDate' },
      { name: 'cost', align: 'left', label: 'Cost', field: 'cost' },
      { name: 'createdDate', align: 'center', label: 'Created At', field: 'createdDate' },
      { name: 'createdBy', align: 'center', label: 'Created By', field: 'createdBy' }
    ]

    const paginationTable = ref({
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 20
    })

    const searchText = ref('')

    const pagination = computed(():ReservationPaginationData => {
      return {
        page: paginationTable.value.page,
        limit: paginationTable.value.rowsPerPage,
        filter: searchText.value
      }
    })

    const { canceledResult: reservationsResult, loading: loadingReservations, canceledTotal: totalReservations, fetchCanceledReservations } = useFetchReservations(pagination)
    watch(totalReservations, () => {
      paginationTable.value.rowsNumber = totalReservations.value
    })

    const rows = computed(() => reservationsResult.value)

    const onRequest = (payload: {pagination: { page: number, rowsNumber: number, rowsPerPage: number }}) => {
      paginationTable.value.page = payload.pagination.page
      paginationTable.value.rowsPerPage = payload.pagination.rowsPerPage
      paginationTable.value.rowsNumber = totalReservations.value
    }

    return {
      reservationsResult,
      loadingReservations,
      fetchCanceledReservations,

      searchText,

      paginationTable,
      onRequest,

      columns,
      rows,
      totalReservations,

      useUserStore,
      notify,
      loggedUserIsAdmin,
      loggedUserIsManager,
      getShortDate
    }
  }
})
</script>
