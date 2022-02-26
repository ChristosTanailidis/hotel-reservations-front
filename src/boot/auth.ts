import { boot } from 'quasar/wrappers'
import { UserManager, WebStorageStateStore } from 'oidc-client'
import { notify } from 'src/utils'

/**
 * Config for the oidc client.
 */
const settings = {
  // Where the tokens will be stored
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  // URL to the authentication server (including realm)
  // todo env
  authority: '',
  // The name of the client in Keycloak setup for this service
  client_id: '',
  // Where to redirect the user to after successful authentication
  redirect_uri: '',
  // Where to redirect the user to after logging the user out
  post_logout_redirect_uri: '',
  // Indicate the the authorization code flow should be used
  response_type: '',
  // "openid" tells the server that this client uses oidc for authentication
  scope: '',
  // Enable automatic (silent) renewal of the access token
  automaticSilentRenew: true
}

const userManager = new UserManager(settings)

// ----------------------------------------------------------------------------------------

/**
 * Class to encapsulate all authentication related logic.
 */
class AuthService {
  /**
   * Initate the login process.
   */
  login () {
    userManager.signinRedirect()
      .catch(error => {
        notify('error', 'Login Error', (error as Error).message)
        console.log(error)
      })
  }

  logout () {
    userManager.signoutRedirect()
      .catch(error => {
        notify('error', 'Logout Error', (error as Error).message)
        console.log(error)
      })
  }

  /**
   * Handles the redirect from the OAuth server after a user logged in.
   */
  handleLoginRedirect () {
    // Returns a promise
    return userManager.signinRedirectCallback()
  }

  /**
   * Handles the redirect from the OAuth server after a user logged out.
   */
  handleLogoutRedirect () {
    return userManager.signoutRedirectCallback()
  }

  /**
   * Checks whether or not a user is currently logged in.
   *
   * Returns a promise which will be resolved to true/false or be rejected with an error.
   */
  isUserLoggedIn () {
    return new Promise((resolve, reject) => {
      userManager.getUser()
        .then(user => {
          if (user === null) {
            resolve(false)
          }
          resolve(true)
        })
        .catch(error => {
          notify('error', 'Error isUserLoggedIn', (error as Error).message)
          reject(error)
        })
    })
  }

  /**
   * Get the profile data for the currently authenticated user.
   *
   * Returns an empty object if no user is logged in.
   */
  getProfile () {
    return new Promise((resolve, reject) => {
      userManager.getUser()
        .then(user => {
          if (user === null) {
            resolve(null)
          }
          resolve(user?.profile)
        })
        .catch(error => {
          notify('error', 'Error getProfile', (error as Error).message)
          reject(error)
        })
    })
  }

  /**
   * Get the access token.
   *
   * Can be used to make requests to the backend.
   */
  getAccessToken () {
    return new Promise((resolve, reject) => {
      userManager.getUser()
        .then(user => {
          if (user) {
            resolve(user.access_token)
          }
        })
        .catch(error => {
          notify('error', 'Error getAccessToken', (error as Error).message)
          reject(error)
        })
    })
  }
}

/**
 * Create and expose an instance of the auth service.
 */
export const authService = new AuthService()

/**
 * Default export to register the authentication service in the global Vue instance.
 *
 * This allows us to reference it using "this.$auth" whenever we are inside of a Vue context.
 */

export default boot(({ app }) => {
  app.config.globalProperties.$auth = authService
})
