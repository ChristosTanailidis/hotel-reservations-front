<template>
  <div class="flex justify-center">
    <div
      style="width: 95%; margin: 15px; "
      class="col-1 justify-center"
    >
      <q-table
        title="Rooms"
        :rows="rows"
        row-key="number"
        v-model:selected="selectedClient"
        :filter="searchText"
        v-model:pagination="paginationTable"
        @request="onRequest"
        :loading="loadingClients"
        no-data-label="No rooms fetched"
        :rows-per-page-options="[5, 5 * 2, 5 * 3, 5 * 4, 5 * 5, 5 * 6, 0]"
        style="height: 100%"
        grid
        hide-header
      >
        <template #top-left>
          <q-btn
            @click="addClient()"
            icon="add"
            style="background-color: #5fe8d8; color: white; min-height: 50px"
            class="q-mb-lg"
            unelevated
          >
            add Client
          </q-btn>
        </template>

        <template #top-right>
          <q-input
            filled
            bottom-slots
            label="Search Clients"
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
              @click="editClient(props.row)"
              class="cursor-pointer rounded-borders flex"
            >
              <ClientCard
                style="width: 320px"
                :client="props.row"
                :key="props.row.id"
              />
            </div>
          </div>
        </template>
      </q-table>
    </div>
    <div v-if="editClientFlag">
      <AddEditClientDialog
        v-model:visible="editClientFlag"
        v-model:client="selectedClient"
        :clients="clientsResult"
        @refetchClients="fetchClients()"
      />
    </div>
    <div v-if="addClientFlag">
      <AddEditClientDialog
        v-model:visible="addClientFlag"
        :client="selectedClient"
        :clients="clientsResult"
        @refetchClients="fetchClients()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'

import { useFetchClients } from 'src/hooks/useClientsQuery'
import { ClientPaginationData } from 'src/components/models/PaginatedData'

import ClientCard from 'src/components/simpleComponents/InfoCards/ClientCard.vue'
import AddEditClientDialog from 'src/components/ClientDialog.vue'

import Client from 'src/components/models/Client'

import { useUserStore } from 'src/store/loggedUser'
import { loggedUserIsAdmin, newClientId, notify } from '../utils'

export default defineComponent({
  name: 'Clients',
  components: {
    ClientCard,
    AddEditClientDialog
  },
  setup () {
    const editClientFlag = ref(false)
    const addClientFlag = ref(false)
    const selectedClient = ref<Client>()

    const paginationTable = ref({
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 20
    })

    const searchText = ref('')

    const pagination = computed(():ClientPaginationData => {
      return {
        page: paginationTable.value.page,
        limit: paginationTable.value.rowsPerPage,
        filter: searchText.value
      }
    })

    const { result: clientsResult, loading: loadingClients, total: totalClients, fetchClients } = useFetchClients(pagination)
    watch(totalClients, () => {
      paginationTable.value.rowsNumber = totalClients.value
    })

    const rows = computed(() => clientsResult.value)

    const onRequest = (payload: {pagination: { page: number, rowsNumber: number, rowsPerPage: number }}) => {
      paginationTable.value.page = payload.pagination.page
      paginationTable.value.rowsPerPage = payload.pagination.rowsPerPage
      paginationTable.value.rowsNumber = totalClients.value
    }

    const editClient = (client: Client) => {
      selectedClient.value = client
      editClientFlag.value = true
    }

    const addClient = () => {
      selectedClient.value = { id: newClientId(), name: '', surname: '', phone: '', email: '', reservations: [] } as Client
      addClientFlag.value = true
    }

    return {
      clientsResult,
      loadingClients,
      fetchClients,
      pagination,
      rows,

      searchText,
      paginationTable,
      onRequest,

      editClient,
      addClient,
      editClientFlag,
      addClientFlag,
      selectedClient,

      useUserStore,
      notify,
      loggedUserIsAdmin
    }
  }
})
</script>
