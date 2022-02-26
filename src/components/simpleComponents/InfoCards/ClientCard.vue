<template>
  <q-card
    flat
    class="my-card"
    style="width: 100%"
    align="center"
  >
    <q-card-section
      class="bg-grey-5"
      horizontal
    >
      <p style="width: 100%; color: white; text-align: center; margin: 1px">
        Client
      </p>
    </q-card-section>
    <q-item style="background-color: #f0f0f0">
      <q-item-section avatar>
        <q-icon
          style=" font-size: 40px"
          name="person_outline"
        />
      </q-item-section>

      <q-item-section>
        <q-item-label> {{ selectedClient.name }} {{ selectedClient.surname }} </q-item-label>
        <q-item-label caption>
          {{ selectedClient.email }}
        </q-item-label>
        <q-item-label caption>
          {{ selectedClient.phone }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'

import Client from '../../models/Client'

export default defineComponent({
  name: 'ClientCard',
  props: {
    client: {
      type: Object as PropType<Client>,
      required: true
    }
  },
  setup (props) {
    const selectedClient = computed(() => props.client)

    return {
      selectedClient
    }
  }
})
</script>
