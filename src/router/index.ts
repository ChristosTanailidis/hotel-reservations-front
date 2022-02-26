import { route } from 'quasar/wrappers'
import { authService } from 'src/boot/auth'
import { AuthUser, useUserStore } from '../store/loggedUser'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'
import routes from './routes'
import { loggedUserIsAdmin, notify } from 'src/utils'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    )
  })

  const restrictedRoutes = [
    '/users'
  ]

  Router.beforeEach((to, _from, next) => {
    if (to.path === '/login') {
      authService.handleLoginRedirect()
        .then(() => {
          next('/reservations')
        })
        .catch(error => {
          notify('error', 'Login Routing Error', (error as Error).message)
          console.log('Login error', error)
          next('/')
        })
    } else if (to.path === '/logout') {
      authService.handleLogoutRedirect()
        .then(() => {
          useUserStore().removeUser()
          localStorage.clear()
          next('/')
        })
        .catch(error => {
          notify('error', 'Logout Routing Error', (error as Error).message)
          console.log('Logout error', error)
          next('/')
        })
    } else if (restrictedRoutes.find(rr => rr === to.path) && !loggedUserIsAdmin()) {
      notify('warning', 'Role Restriction', 'Access forbidden for this page')
      setTimeout(() => {
        notify('', 'Redirecting to a valid page...')
      }, 500)

      setTimeout(() => {
        next(`${routes[0].path}${routes[0].children ? routes[0].children[1].path : ''}`)
      }, 2000)
    } else {
      authService.getProfile().then(res => {
        useUserStore().addUser(res as AuthUser)
        authService.getAccessToken()
          .then(token => {
            localStorage.setItem('token', token as string)
          })
          .catch(err => {
            notify('error', 'Access Token Error on Routing', (err as Error).message)
            console.log(err)
          })
      })
        .catch(err => {
          notify('error', 'Cant get profile on routing', (err as Error).message)
          console.log('Error', err)
        })
      next()
    }
  })

  return Router
})
