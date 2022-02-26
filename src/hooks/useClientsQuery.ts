import { ref, onMounted, Ref, watch } from 'vue'
import { print } from 'graphql'
import { api } from 'src/boot/axios'
import { GraphQLResponse } from 'src/components/models/AxiosResponse'

import { clientEmailValidation, getClients } from 'src/assets/gql/client.query'
import { ClientPaginationData } from 'src/components/models/PaginatedData'
import Client from 'src/components/models/Client'

import { notify } from 'src/utils'

export function useFetchClients (clientFetchPagination: Ref<ClientPaginationData>) {
  const result = ref<Client[]>([])
  const total = ref(0)
  const loading = ref(false)

  const page = ref(clientFetchPagination.value.page)

  const fetchClients = async () => {
    try {
      loading.value = true
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(getClients),
          variables: {
            getClientsPagination: {
              page: clientFetchPagination.value.page,
              limit: clientFetchPagination.value.limit,
              filter: clientFetchPagination.value.filter
            }
          }
        }
      }) as unknown as GraphQLResponse<{ getClients: { clients: Client[], total: number}}>

      if (response.data.data) {
        result.value = response.data.data.getClients.clients
        total.value = response.data.data.getClients.total
      } else {
        console.log('fetch clients error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on fetch clients', (e as Error).message)
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const clientEmailExists = async (clientEmail: string, id: string) => {
    try {
      loading.value = true
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(clientEmailValidation),
          variables: {
            clientEmailExistsEmail: clientEmail,
            clientEmailExistsId: id
          }
        }
      }) as unknown as GraphQLResponse<{ exists: boolean }>

      if (response.data.data) {
        return response.data.data.exists
      } else {
        console.log('fetch validation error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on fetch validation', (e as Error).message)
      console.log(e)
    } finally {
      loading.value = false
    }
    return null
  }

  const nextPage = async () => {
    page.value += 1
    await fetchClients()
  }

  onMounted(async () => {
    await fetchClients().catch(e => {
      notify('error', 'Cant fetch clients', (e as Error).message)
      console.log(e)
    })
  })

  watch(clientFetchPagination, async () => {
    await fetchClients()
  })

  return {
    result,
    loading,
    total,
    fetchClients,
    clientEmailExists,
    nextPage
  }
}
