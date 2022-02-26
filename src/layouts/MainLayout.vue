<template>
  <q-layout view="hHh LpR lFf">
    <q-header

      class="bg-teal-4"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="widgets"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title
          class="text-h4"
          style="color: #DDFAF7"
        >
          Reservations
        </q-toolbar-title>

        <div>
          <q-btn
            v-if="useUserStore().id === ''"
            @click="login()"
            style="background-color: #5fe8d8; color: white"
          >
            Login
          </q-btn>
          <q-btn
            v-else
            @click="logout()"
            style="background-color: #5fe8d0; color: white"
          >
            Logout
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above

      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay

      class="bg-grey-3"
    >
      <q-list>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
      <q-separator />
      <q-list v-if="loggedUserIsAdmin()">
        <EssentialLink
          v-for="link in adminLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-footer
      class="bg-transparent flex justify-end"
      v-if="useUserStore().id !== ''"
    >
      <q-fab
        color="amber"
        text-color="black"
        icon="account_circle"
        direction="left"
        class=" q-mr-sm q-mb-sm"
      >
        <q-fab-action
          class="bg-teal-4 text-white"
          style="padding: 0px; margin-right: 0px"
        >
          <q-chip
            dense
            class="bg-teal-4 text-white"
          >
            <q-icon
              name="person"
              class="q-mr-xs "
            />
            {{ useUserStore().name }}
          </q-chip>
          <q-chip
            dense
            class="bg-teal-4 text-white"
          >
            <q-icon
              name="admin_panel_settings"
              class="q-mr-xs "
            />
            {{ useUserStore().role }}
          </q-chip>
          <q-btn
            @click="logout()"
            style="background-color: #5fe8d0; color: white;"
            round
            icon="logout"
          />
        </q-fab-action>
      </q-fab>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="css">
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.text-my-color {
  color: #5fe8d8;
}
</style>

<style lang="sass">
.shadow-box
  width: 90px
  height: 90px
  margin: 25px
  border-radius: 50%
  font-size: 12px
</style>

<script lang="ts">
import EssentialLink from 'components/EssentialLink.vue'
import { authService } from 'src/boot/auth'
import { useUserStore } from 'src/store/loggedUser'
import { loggedUserIsAdmin } from 'src/utils'

const linksList = [
  {
    title: 'New Reservation',
    caption: 'Create a new room reservation',
    icon: 'hotel',
    link: 'reservations'
  },
  {
    title: 'All Rooms',
    caption: 'Search, Create, Edit and Delete rooms',
    icon: 'bed',
    link: 'rooms'
  },
  {
    title: 'All Clients',
    caption: 'Search, Create, Edit and Delete clients',
    icon: 'groups',
    link: 'clients'
  },
  {
    title: 'Canceled Reservations',
    caption: 'Search all canceled reservations',
    icon: 'event_busy',
    link: 'canceledReservations'
  }
]

const adminLinksList = [
  {
    title: 'Edit Users',
    caption: 'Search users',
    icon: 'manage_accounts',
    link: 'users'
  }
]

import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const userDrawerOpen = ref(false)
    const miniState = ref(true)

    onMounted(() => {
      login()
    })

    loggedUserIsAdmin()

    const login = () => {
      if (useUserStore().id === '') {
        authService.login()
      }
    }

    const logout = () => {
      authService.logout()
    }

    return {
      login,
      logout,
      useUserStore,
      loggedUserIsAdmin,

      essentialLinks: linksList,
      adminLinks: adminLinksList,
      leftDrawerOpen,
      userDrawerOpen,
      miniState,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>
