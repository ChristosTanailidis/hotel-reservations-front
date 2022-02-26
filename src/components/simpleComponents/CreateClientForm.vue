<template>
  <div
    v-if="visible"
    style="width: 100%; margin: 4px;"
    class="column bg-grey-2 rounded-borders"
  >
    <q-form
      style="width: 80%; padding-bottom: 20px"
      class="column self-center"
      greedy
    >
      <div class="text-h6 self-center">
        Create User
      </div>
      <q-input
        filled
        v-model="clinetObj.name"
        label="First Name"
        style="margin: 4px"
      />
      <q-input
        filled
        v-model="clinetObj.surname"
        label="Last Name"
        style="margin: 4px"
      />
      <q-input
        filled
        v-model="clinetObj.phone"
        label="Phone"
        style="margin: 4px"
      />
      <q-input
        filled
        v-model="clinetObj.email"
        type="email"
        label="Email"
        style="margin: 4px"
      />
      <div
        class="row self-center justify-between"
        style="width: 98%; margin: 5px"
      >
        <q-btn
          style="width: 48%; background-color: #728a87; color: white"
          @click="closeCreation()"
        >
          Cancel
        </q-btn>
        <q-btn
          style="width: 48%; background-color: #5fe8d8; color: white"
          @click="createUser()"
        >
          Create
        </q-btn>
      </div>
    </q-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref } from 'vue'

import { ClientPaginationData } from '../models/PaginatedData'
import { useClientsMutation } from 'src/hooks/useClientsMutation'
import { useFetchClients } from 'src/hooks/useClientsQuery'

import Client from '../models/Client'
import ClientInputData from '../models/InputData/ClientInputData'

import { notify } from 'src/utils'

export default defineComponent({
  name: 'CreateClientFrom',
  emits: ['update:visible', 'update:client', 'refetchClients'],
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    client: {
      type: Object as PropType<Client>,
      default: { name: '', surname: '', email: '', phone: '' } as Client,
      required: true
    }
  },

  setup (props, { emit }) {
    const { addClient } = useClientsMutation()

    const pagination = ref({ page: 1, limit: 0, filter: '' } as ClientPaginationData)
    const { loading, clientEmailExists } = useFetchClients(pagination)

    const clinetObj = ref(props.client) as Ref<Client>

    onMounted(() => {
      emptyClientObj()
    })

    const createUser = async () => {
      if (!await valid()) { return null } // validatating data

      // prepare input data
      const clientInputData: ClientInputData = {
        name: clinetObj.value.name,
        surname: clinetObj.value.surname,
        phone: clinetObj.value.phone,
        email: clinetObj.value.email
      }

      // create client
      addClient(clientInputData).then((res) => {
        if (res) {
          emit('update:client', res) // update client
          notify('success', 'User created')
          closeCreation()
        } else {
          notify('error', 'Error', 'Cant create user')
        }
      }).catch((err) => {
        notify('error', 'Exception in addNewClient', (err as Error).message)
        console.log(err)
      })
    }

    // data validation
    const valid = async () => {
      const validation = [] as { pass: boolean, msg: string }[]

      const emailExists = await clientEmailExists(clinetObj.value.email, clinetObj.value.id)

      // eslint-disable-next-line no-useless-escape
      const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
      const numberReg = /^\+[0-9]{10,}$/

      validation.push({ pass: clinetObj.value.name.length > 3, msg: 'Name must be longer than 3 characters' })
      validation.push({ pass: clinetObj.value.surname.length > 3, msg: 'Surname must be longer than 3 characters' })
      validation.push({ pass: numberReg.test(clinetObj.value.phone), msg: 'Phone number includes +(regional code) and must have more than 10 characters' })
      validation.push({ pass: clinetObj.value.phone.charAt(0) === '+', msg: 'Phone number starts with +(Region code)' })
      validation.push({ pass: emailReg.test(clinetObj.value.email), msg: 'Invalid mail' })
      validation.push({ pass: !emailExists && !loading.value, msg: 'Client email already exists' })

      const valError = validation.find(v => !v.pass)
      if (valError) {
        notify('warning', 'Invalid Data', valError.msg)
        return false
      }
      return true
    }

    const closeCreation = () => {
      emptyClientObj()
      emit('update:visible', false)
    }

    const emptyClientObj = () => {
      if (clinetObj) {
        clinetObj.value = { name: '', surname: '', email: '', phone: '' } as Client
      }
    }

    return {
      clinetObj,

      createUser,
      closeCreation
    }
  }
})
</script>
