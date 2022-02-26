/* eslint-disable camelcase */
import { defineStore } from 'pinia'

export interface AuthUser {
  sub: string
  azp: string
  resource_access: {
    [key: string]: {
      roles: string[]
    }
  }
  scope: string
  email: string
  name: string
  preferred_username: string
}

export const useUserStore = defineStore({
  id: 'loggedUser',
  state: () => {
    const id = ''
    const name = ''
    const email = ''
    const role = ''

    return {
      id,
      name,
      email,
      role
    }
  },
  actions: {
    addUser (userLogged: AuthUser) {
      this.$patch({
        id: userLogged.sub,
        name: userLogged.name,
        email: userLogged.email,
        role: userLogged.resource_access['generic-quasar-client'] ? userLogged.resource_access['generic-quasar-client'].roles.toString() : 'manager'
      })
    },
    removeUser () {
      this.$reset()
    }
  }
})
