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
        <q-skeleton
          style=" font-size: 40px"
          type="QAvatar"
        />
      </q-item-section>

      <q-item-section align="left">
        <q-item-label> <q-skeleton type="text" /> </q-item-label>
        <q-item-label caption>
          <q-skeleton
            width="50%"
            type="text"
          />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton
            width="70%"
            type="text"
          />
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SkeletonClientComponent'
})
</script>
