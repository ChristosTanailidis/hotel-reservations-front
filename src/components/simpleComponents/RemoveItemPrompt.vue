<template>
  <q-dialog
    v-model="dialogFlag"
    persistent
  >
    <q-card>
      <div
        class="flex justify-center q-pa-sm bg-orange-5"
        style="width: 100%"
      >
        <q-icon
          align="center"
          name="error"
          color="white"
          size="35px"
        />
      </div>
      <q-card-section class="row items-center">
        <p> You ar about to delete this {{ typeOfItem }}</p>
        <!-- <span
          v-if="isClient()"
          class="q-ma-sm"
        >You are about to delete this client </span>
        <span
          v-else-if="isRoom()"
          class="q-ma-sm"
        >You are about to delete this room</span>
        <span
          v-else-if="isUser()"
          class="q-ma-sm"
        >You are about to delete this user</span> -->
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          class="bg-grey-3"
          v-close-popup
        />
        <q-btn
          flat
          label="Confirm"
          class="bg-orange-5 text-white"
          @click="removeItem()"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'

import { useClientsMutation } from 'src/hooks/useClientsMutation'
import { useRoomsMutation } from 'src/hooks/useRoomsMutation'
import { useUsersMutation } from 'src/hooks/useUsersMutation'

import Client from 'src/components/models/Client'
import Room from 'src/components/models/Room'

import { notify } from 'src/utils'

export default defineComponent({
  name: 'RemoveItemPrompt',
  emits: ['update:visible', 'refetchData', 'closeDialog'],
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    typeOfItem: {
      type: String,
      required: true
    },
    itemToRemove: {
      type: Object as PropType<Client|Room>,
      required: true
    }
  },

  setup (props, { emit }) {
    const dialogFlag = ref(props.visible)

    const item = ref<Client|Room>()

    const removeItem = () => {
      if (isClient()) { // remove client
        item.value = props.itemToRemove

        const { removeClient } = useClientsMutation()
        removeClient(item.value.id).then((res) => {
          if (res) {
            notify('success', 'Client Deleted')
            emit('closeDialog')
          } else {
            notify('error', 'Error on client delete!')
          }
        }).catch((err) => {
          notify('error', 'Exception in delete client', (err as Error).message)
          console.log(err)
        })
      } else if (isRoom()) { // remove room
        item.value = props.itemToRemove

        const { removeRoom } = useRoomsMutation()
        removeRoom(item.value.id).then((res) => {
          if (res) {
            notify('success', 'Room Deleted')
            emit('closeDialog')
          } else {
            notify('error', 'Error on room delete!')
          }
        }).catch((err) => {
          notify('error', 'Exception in delete room', (err as Error).message)
          console.log(err)
        })
      } else if (isUser()) {
        item.value = props.itemToRemove

        const { removeUser } = useUsersMutation()
        removeUser(item.value.id).then((res) => {
          if (res) {
            notify('success', 'User Deleted')
            emit('closeDialog')
          } else {
            notify('error', 'Error on user delete!')
          }
        }).catch((err) => {
          notify('error', 'Exception in delete user', (err as Error).message)
          console.log(err)
        })
      } else { // none of the above
        notify('Error', 'Cant remove', 'Type of the item is not defined')
      }
      emit('update:visible', false)
      emit('refetchData', false)
    }

    const isClient = () => {
      return props.typeOfItem.toLowerCase() === 'client'
    }

    const isRoom = () => {
      return props.typeOfItem.toLowerCase() === 'room'
    }

    const isUser = () => {
      return props.typeOfItem.toLowerCase() === 'user'
    }

    return {
      dialogFlag,
      removeItem,

      isClient,
      isRoom,
      isUser
    }
  }
})
</script>
