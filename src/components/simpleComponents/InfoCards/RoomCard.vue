<template>
  <q-card
    flat
    class="my-card"
    style="width: 100%"
    align="center"
  >
    <q-card-section
      :style="`background-color: ${selectedRoom.color}`"
      horizontal
    >
      <div
        class="row justify-between"
        style="width: 100%"
      >
        <div style="width: 18px" />
        <p style="color: white; text-align: center; margin: 1px">
          Room
        </p>
        <div
          v-if="clickable"
          class="row justify-end"
        >
          <q-icon
            name="sync_alt"
            style="color: white; margin-right: 4px"
            class="self-center"
          />
        </div>
        <div
          v-else
          style="width: 18px"
        />
      </div>
    </q-card-section>
    <q-item style="background-color: #f0f0f0">
      <q-item-section avatar>
        <q-icon
          style=" font-size: 40px"
          name="bed"
        />
      </q-item-section>

      <q-item-section>
        <q-item-label> Room: {{ selectedRoom.number }} </q-item-label>
        <q-item-label caption>
          Room Capacity: {{ selectedRoom.capacity }}
        </q-item-label>
        <div class="flex justify-center">
          <q-item-label
            class="self-center"
            caption
          >
            Level:
          </q-item-label>

          <q-rating
            v-model="selectedRoom.levelType"
            size="15px"
            :max="4"
            no-reset
            readonly
            color="orange-3"
            class="self-center"
          />
        </div>
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import Room from '../../models/Room'

export default defineComponent({
  name: 'RoomCard',
  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },
    clickable: {
      type: Boolean
    }
  },
  setup (props) {
    const selectedRoom = ref(props.room)

    return {
      selectedRoom
    }
  }
})
</script>
