<template>
  <div class="flex justify-center q-pt-md">
    <div class="rounded-borders bg-grey-2 q-pa-md">
      <div class="row">
        <q-input
          filled
          bottom-slots
          label="Search Rooms"
          v-model="searchText"
          style="width: 100%"
        >
          <template #append>
            <q-icon
              v-if="searchText.length > 0"
              name="close"
              class="cursor-pointer"
            />
            <q-icon
              v-else
              name="search"
            />
          </template>
        </q-input>
      </div>
      <div class="row">
        <q-table
          dense
          :loading="loadingUsers"
          title="Users"
          :columns="columns"
          :rows="rows"
          no-data-label="No users fetched"
          row-key="id"
          v-model:pagination="paginationTable"
          @request="onRequest"
          style="width: 1000px"
        >
          <template #header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                {{ col.label }}
              </q-th>
              <q-th> Remove </q-th>
            </q-tr>
          </template>

          <template #body="props">
            <q-tr :props="props">
              <q-td
                key="fullName"
                :props="props"
              >
                {{ props.row.fullName }}
              </q-td>
              <q-td
                key="email"
                :props="props"
              >
                {{ props.row.email }}
              </q-td>
              <q-td
                key="role"
                :props="props"
              >
                <q-chip dense>
                  <q-icon
                    v-if="props.row.role.toLowerCase() === 'admin'"
                    name="admin_panel_settings"
                    size="20px"
                  />
                  <q-icon
                    v-else
                    name="support_agent"
                    size="20px"
                  />
                  {{ props.row.role.toLowerCase() }}
                </q-chip>
              </q-td>
              <q-td align="center">
                <q-btn
                  icon="delete"
                  round
                  dense
                  unelevated
                  size="12px"
                  class="bg-red-4 text-white"
                  @click="removeUser(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
    <div v-if="removeUserFlag">
      <RemoveItemPrompt
        v-model:visible="removeUserFlag"
        :type-of-item="'user'"
        :item-to-remove="selectedUser"
        @closeDialog="removeUserFlag = false"
        @refetchData="fetchUsers"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'

import { useFetchUsers } from 'src/hooks/useUsersQuery'
import { UserPaginationData } from 'src/components/models/PaginatedData'

import RemoveItemPrompt from 'src/components/simpleComponents/RemoveItemPrompt.vue'

import User from 'src/components/models/User'

import { useUserStore } from 'src/store/loggedUser'
import { loggedUserIsAdmin, notify } from 'src/utils'

export default defineComponent({
  name: 'Users',
  components: {
    RemoveItemPrompt
  },
  setup () {
    const removeUserFlag = ref(false)

    const selectedUser = ref<User>()

    const columns = [
      { name: 'fullName', align: 'left', label: 'Full Name', field: 'fullName' },
      { name: 'email', align: 'center', label: 'Email', field: 'email' },
      { name: 'role', align: 'center', label: 'Role', field: 'role' }
    ]

    const paginationTable = ref({
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 20
    })

    const searchText = ref('')

    const pagination = computed(():UserPaginationData => {
      return {
        page: paginationTable.value.page,
        limit: paginationTable.value.rowsPerPage,
        filter: searchText.value
      }
    })

    const { result: usersResult, loading: loadingUsers, total: totalUsers, fetchUsers } = useFetchUsers(pagination)
    watch(totalUsers, () => {
      paginationTable.value.rowsNumber = totalUsers.value
    })

    const rows = usersResult

    const onRequest = (payload: {pagination: { page: number, rowsNumber: number, rowsPerPage: number }}) => {
      paginationTable.value.page = payload.pagination.page
      paginationTable.value.rowsPerPage = payload.pagination.rowsPerPage
      paginationTable.value.rowsNumber = totalUsers.value
    }

    const removeUser = (user: User) => {
      selectedUser.value = user
      removeUserFlag.value = true
    }

    return {
      usersResult,
      loadingUsers,
      fetchUsers,

      searchText,

      paginationTable,
      onRequest,

      removeUser,
      removeUserFlag,
      selectedUser,

      columns,
      rows,
      totalUsers,

      useUserStore,
      notify,
      loggedUserIsAdmin
    }
  }
})
</script>
