import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/Reservations.vue') },
      { path: 'Reservations', component: () => import('src/pages/Reservations.vue') },
      { path: 'Rooms', component: () => import('src/pages/Rooms.vue') },
      { path: 'Clients', component: () => import('src/pages/Clients.vue') },
      { path: 'Users', component: () => import('src/pages/Users.vue') },
      { path: 'CanceledReservations', component: () => import('src/pages/CanceledReservations.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
