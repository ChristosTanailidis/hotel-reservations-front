import { print } from 'graphql'
import { api } from 'src/boot/axios'
import { GraphQLResponse } from 'src/components/models/AxiosResponse'

import { createClient, deleteClient, updateClient } from 'src/assets/gql/client.mutation'
import ClientInputData from 'src/components/models/InputData/ClientInputData'
import Client from 'src/components/models/Client'

import { notify } from 'src/utils'

export function useClientsMutation () {
  const addClient = async (client: ClientInputData) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(createClient),
          variables: {
            createClientData: {
              ...client
            }
          }
        }
      }) as unknown as GraphQLResponse<{ client: Client }>

      if (response.data.data) {
        return response.data.data.client
      } else {
        notify('error', 'Add client error')
        console.log('add client error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on create client', (e as Error).message)
      console.log(e)
    }
  }

  const editClient = async (client: ClientInputData, clientId: string) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(updateClient),
          variables: {
            updateClientData: {
              ...client
            },
            updateClientId: clientId
          }
        }
      }) as unknown as GraphQLResponse<{ client: Client }>

      if (response.data.data) {
        return response.data.data.client
      } else {
        notify('error', 'Update client error')
        console.log('update client error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on update client', (e as Error).message)
      console.log(e)
    }
  }

  const removeClient = async (clientId: string) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(deleteClient),
          variables: {
            deleteClientId: clientId
          }
        }
      }) as unknown as GraphQLResponse<{ response: boolean }>

      if (response.data.data) {
        return response.data.data.response
      } else {
        notify('error', 'Delete client error')
        console.log('delete client error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on delete client', (e as Error).message)
      console.log(e)
    }
  }

  return {
    addClient,
    editClient,
    removeClient
  }
}
