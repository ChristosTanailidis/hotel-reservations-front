<template>
  <q-select
    filled
    v-model="selectedOption"
    use-input
    input-debounce="0"
    label="Search client... "
    :options="options"
    @filter="filterFn"
    style="width: 100%; padding: 0px"
    @update:model-value="setClient"
    @focus="fetchClients"
  >
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label caption>
            {{ scope.opt.description }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed, watch } from 'vue'

import { ClientPaginationData } from 'src/components/models/PaginatedData'
import { useFetchClients } from 'src/hooks/useClientsQuery'

import Client from '../models/Client'

export default defineComponent({
  name: 'SearchClient',
  emits: ['update:selectedClient'],
  props: {
    selectedClient: {
      type: Object as PropType<Client>,
      default: { name: '', surname: '', email: '', phone: '' } as Client,
      required: true
    }
  },
  setup (props, { emit }) {
    const clietPagination = ref({ page: 1, limit: 0, filter: '' } as ClientPaginationData)
    const { result: clientsResult, fetchClients } = useFetchClients(clietPagination)

    const clients = computed(() => clientsResult.value)
    const selectedClient = computed(() => props.selectedClient)

    const options = ref([] as {label: string, value: string, description: string}[])
    clients.value.forEach(c => {
      options.value.push({ label: c.email, value: c.email, description: `${c.name} ${c.surname}` })
    })

    const selectedOption = ref({ label: selectedClient.value.email, value: selectedClient.value.email, description: `${selectedClient.value.name} ${selectedClient.value.surname}` })

    // if selectedClient gets changed by other component on the reservation dialog (eg: createClient)
    watch(selectedClient, () => {
      selectedOption.value = { label: selectedClient.value.email, value: selectedClient.value.email, description: `${selectedClient.value.name} ${selectedClient.value.surname}` }
    })

    // return the client on selection
    const setClient = () => {
      emit('update:selectedClient', clients.value.find(c => c.email === selectedOption.value.value))
    }

    // Quasar function for searching data
    // eslint-disable-next-line @typescript-eslint/ban-types
    const filterFn = (val: string, update: Function) => {
      if (val === '') {
        update(() => {
          options.value = []
          clients.value.forEach(c => {
            options.value.push({ label: c.email, value: c.email, description: `${c.name} ${c.surname}` })
          })
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        const clientsFiltered = clients.value.filter(c => c.email.toLowerCase().indexOf(needle) > -1 || c.name.toLowerCase().indexOf(needle) > -1 || c.surname.toLowerCase().indexOf(needle) > -1)
        options.value = []
        clientsFiltered.forEach(cc => {
          options.value.push({ label: cc.email, value: cc.email, description: `${cc.name} ${cc.surname}` })
        })
      })
    }

    return {
      options,
      selectedOption,

      setClient,
      filterFn,

      fetchClients
    }
  }
})
</script>
