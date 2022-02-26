<template>
  <div>
    <q-dialog
      v-model="dialogVisibility"
      persistent
      style="padding: 0px"
    >
      <q-card style="min-width: 950px; padding: 15px; padding: 0px">
        <q-card-section
          class="bg-grey-5 items-center"
          style="height: 30px"
          horizontal
        >
          <p style="width: 100%; color: white; text-align: center; margin: 1px">
            Selected Client
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
            @submit="submitClient()"
            @reset="closeDialog()"
            style="width: 100%"
          >
            <q-scroll-area
              :thumb-style="thumbStyle"
              :content-style="contentStyle"
              :content-active-style="contentActiveStyle"
              :style="isNewClient(selectedClient.id) ? 'height: 200px' : 'height: 350px; '"
            >
              <div class="row justify-around">
                <q-input
                  filled
                  v-model="selectedClient.name"
                  label="Name"
                  style="margin: 4px; width: 49%"
                >
                  <template #prepend>
                    <q-icon name="face" />
                  </template>
                </q-input>
                <q-input
                  filled
                  v-model="selectedClient.surname"
                  label="Surname"
                  style="margin: 4px; width: 49%"
                >
                  <template #prepend>
                    <q-icon name="radio_button_unchecked" />
                  </template>
                </q-input>
              </div>
              <div class="row justify-around">
                <q-input
                  filled
                  v-model="selectedClient.phone"
                  label="Phone"
                  style="margin: 4px; width: 49%"
                >
                  <template #prepend>
                    <q-icon name="phone_iphone" />
                  </template>
                </q-input>
                <q-input
                  filled
                  debounce="1000"
                  v-model="selectedClient.email"
                  type="email"
                  label="Email"
                  style="margin: 4px; width: 49%"
                >
                  <template #prepend>
                    <q-icon name="alternate_email" />
                  </template>
                </q-input>
              </div>
              <q-table
                v-if="!isNewClient(selectedClient.id)"
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
                v-if="!isNewClient(selectedClient.id)"
                flat
                class="bg-red-5 text-grey-2"
                label="Delete"
                @click="deleteDialogFlag = true"
              />
              <q-btn
                type="submit"
                flat
                style="background-color: #5fe8d8; color: white; min-width: 200px"
                :label="isNewClient(selectedClient.id) ? 'Add Client' : 'Update'"
              />
            </q-card-actions>
          </q-form>
        </q-item>
      </q-card>
      <div v-if="deleteDialogFlag">
        <RemoveItemPrompt
          v-model:visible="deleteDialogFlag"
          :type-of-item="'client'"
          :item-to-remove="selectedClient"
          @closeDialog="closeDialog()"
        />
      </div>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue'

import { ClientPaginationData } from 'src/components/models/PaginatedData'
import { useClientsMutation } from 'src/hooks/useClientsMutation'
import { useFetchClients } from 'src/hooks/useClientsQuery'

import RemoveItemPrompt from 'src/components/simpleComponents/RemoveItemPrompt.vue'

import Client from './models/Client'
import ClientInputData from './models/InputData/ClientInputData'
import Reservation from './models/Reservation'

import { getDaysDifference, getShortDate, isNewClient, notify } from 'src/utils'

export default defineComponent({
  name: 'EditClientDialog',
  emits: ['update:visible', 'refetchClients'],
  components: {
    RemoveItemPrompt
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    client: {
      type: Object as PropType<Client>,
      required: true
    },
    clients: {
      type: Object as PropType<Client[]>,
      required: true
    }
  },

  setup (props, { emit }) {
    const dialogVisibility = ref(props.visible)
    const deleteDialogFlag = ref(false)
    const selectedClient = ref(props.client)

    const { addClient, editClient } = useClientsMutation()

    const submitClient = async () => {
      if (!await valid()) { return null }

      // Prepare clientInputData for creation
      const clientInputData: ClientInputData = {
        name: selectedClient.value.name,
        surname: selectedClient.value.surname,
        phone: selectedClient.value.phone,
        email: selectedClient.value.email
      }

      if (isNewClient(selectedClient.value.id)) { // adding client
        addClient(clientInputData).then((res) => {
          if (res) {
            notify('success', 'Client Added')
            emit('refetchClients')
            closeDialog()
          } else {
            notify('error', 'Error on client create!', 'Please check your fields.')
          }
        }).catch((err) => {
          notify('error', 'Exception in create client', (err as Error).message)
          console.log(err)
        })
      } else { // editing client
        editClient(clientInputData, selectedClient.value.id).then((res) => {
          if (res) {
            notify('success', 'Client Updated')
            closeDialog()
          } else {
            notify('error', 'Error on client update!', 'Please check your fields.')
          }
        }).catch((err) => {
          notify('error', 'Exception in update client', (err as Error).message)
          console.log(err)
        })
      }
    }

    const valid = async () => {
      const validation: {pass: boolean, msg: string}[] = []

      const emailExists = await clientEmailExists(selectedClient.value.email, selectedClient.value.id)

      // eslint-disable-next-line no-useless-escape
      const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
      const numberReg = /^\+[0-9]{10,}$/

      validation.push({ pass: selectedClient.value.name.length > 3, msg: 'Name must be longer than 3 characters' })
      validation.push({ pass: selectedClient.value.surname.length > 3, msg: 'Surname must be longer than 3 characters' })
      validation.push({ pass: numberReg.test(selectedClient.value.phone), msg: 'Phone number includes +(regional code) and must have more than 10 characters' })
      validation.push({ pass: selectedClient.value.phone.charAt(0) === '+', msg: 'Phone number starts with +(Region code)' })
      validation.push({ pass: emailReg.test(selectedClient.value.email), msg: 'Invalid mail' })
      validation.push({ pass: !emailExists && !loading.value, msg: 'Client email already exists' })

      const valError = validation.find(v => !v.pass)
      if (valError) {
        notify('warning', 'Invalid Data', valError.msg)
        return false
      }
      return true
    }

    // close dialog
    const closeDialog = () => {
      emit('refetchClients')
      emit('update:visible', false)
    }

    // reservations
    const reservationsRows = computed(() => {
      const temp = [] as Reservation[]
      selectedClient.value.reservations.forEach(r => {
        if (getDaysDifference(new Date(r.createdDate.toString()), new Date()) < 30) {
          temp.push(r as Reservation)
        }
      })
      return temp
    })

    // column names
    const reservationsColumns = [
      { name: 'room', label: 'Room', align: 'left', sortable: true, field: (row: Reservation) => row.room.number },
      { name: 'fromDate', label: 'Start Date', align: 'left', sortable: true, field: (row: Reservation) => getShortDate(new Date(row.fromDate)) },
      { name: 'toDate', label: 'End Date', align: 'left', sortable: true, field: (row: Reservation) => getShortDate(new Date(row.toDate)) },
      { name: 'people', label: 'Visitors', align: 'left', sortable: true, field: (row: Reservation) => row.people },
      { name: 'totalPrice', label: 'Price', align: 'left', sortable: true, field: (row: Reservation) => row.totalPrice },
      { name: 'createdDate', label: 'Reservation Date', align: 'left', sortable: true, field: (row: Reservation) => getShortDate(new Date(row.createdDate)) },
      { name: 'createdBy', label: 'Created By', align: 'left', sortable: true, field: (row: Reservation) => row.createdBy.fullName }
    ]

    // client name validation on typing with debounce
    const pagination = ref({ page: 1, limit: 0, filter: '' } as ClientPaginationData)
    const { loading, clientEmailExists } = useFetchClients(pagination)

    watch(selectedClient.value, async () => {
      if (await clientEmailExists(selectedClient.value.email, selectedClient.value.id)) {
        // eslint-disable-next-line no-useless-escape
        notify('warning', `Client number \"${selectedClient.value.email}\" already exists`)
      }
    })

    return {
      dialogVisibility,
      deleteDialogFlag,
      closeDialog,

      selectedClient,
      reservationsRows,
      reservationsColumns,

      submitClient,

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
