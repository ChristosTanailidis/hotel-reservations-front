import { print } from 'graphql'
import { api } from 'src/boot/axios'
import { GraphQLResponse } from 'src/components/models/AxiosResponse'

import { deleteUser } from 'src/assets/gql/user.mutation'

import { notify } from 'src/utils'

export function useUsersMutation () {
  const removeUser = async (userId: string) => {
    try {
      const response = await api({
        url: '',
        method: 'post',
        data: {
          query: print(deleteUser),
          variables: {
            deleteUserId: userId
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
    removeUser
  }
}
