import { ref, onMounted, Ref, watch } from 'vue'
import { print } from 'graphql'
import { api } from 'src/boot/axios'
import { GraphQLResponse } from 'src/components/models/AxiosResponse'

import { getUsers } from 'src/assets/gql/user.query'
import { UserPaginationData } from 'src/components/models/PaginatedData'
import User from 'src/components/models/User'

import { notify } from 'src/utils'

export function useFetchUsers (userPaginationData: Ref<UserPaginationData>) {
  const result = ref<User[]>([])
  const total = ref(0)
  const loading = ref(false)

  const page = ref(userPaginationData.value.page)

  const fetchUsers = async () => {
    try {
      loading.value = true
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(getUsers),
          variables: {
            getUsersPagination: {
              page: userPaginationData.value.page,
              limit: userPaginationData.value.limit,
              filter: userPaginationData.value.filter
            }
          }
        }
      }) as unknown as GraphQLResponse<{ getUsers: { users: User[], total: number}}>

      if (response.data.data) {
        result.value = response.data.data.getUsers.users
        total.value = response.data.data.getUsers.total
      } else {
        console.log('fetch users error', response.data.errors)
      }
    } catch (e) {
      notify('error', 'Exception on fetch users', (e as Error).message)
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const nextPage = async () => {
    page.value += 1
    await fetchUsers()
  }

  onMounted(async () => {
    await fetchUsers().catch(e => {
      notify('error', 'Cant fetch users', (e as Error).message)
      console.log(e)
    })
  })

  watch(userPaginationData, async () => {
    await fetchUsers()
  })

  // watch(userPaginationData.value, async () => {
  //   await fetchUsers()
  // })

  return {
    result,
    loading,
    total,
    fetchUsers,
    nextPage
  }
}
