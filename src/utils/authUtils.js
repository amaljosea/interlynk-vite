import axios from 'axios'
import { client } from 'context/ApolloWrapper'
import Cookies from 'js-cookie'

const navigate = (path) => {
  window.history.pushState({}, '', path)
  const navEvent = new PopStateEvent('popstate')
  window.dispatchEvent(navEvent)
}

export const clearData = () => {
  client.clearStore()
  sessionStorage.clear()
  Cookies.remove('authToken')
  Cookies.remove('refreshToken')
  Cookies.remove('signedParamId')
  Cookies.remove('userToken')
}

export const logoutUser = async () => {
  logError() // Added for debugging random logouts

  const logoutURL = process.env.REACT_APP_VENDOR_LOGOUT_URL
  const authToken = Cookies.get('authToken')

  try {
    // Attempt to inform the server about the logout
    await axios.delete(`${logoutURL}`, {
      headers: {
        credentials: 'include',
        Authorization: authToken
      }
    })
  } catch (error) {
    console.warn('Logout failed')
  } finally {
    clearData()
    navigate('/auth')
  }
}

const logError = () => {
  console.warn('Cookies:', Cookies.get())
  console.warn('Session:', localStorage)
}
