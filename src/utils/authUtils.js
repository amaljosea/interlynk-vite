import axios from 'axios'
import { client } from 'context/ApolloWrapper'
import Cookies from 'js-cookie'

const navigate = (path) => {
  window.history.pushState({}, '', path)
  const navEvent = new PopStateEvent('popstate')
  window.dispatchEvent(navEvent)
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
    console.error('Logout failed')
  } finally {
    client.clearStore()
    sessionStorage.clear()
    Cookies.remove('authToken')
    Cookies.remove('signedParamId')
    Cookies.remove('userToken')
    navigate('/auth')
  }
}

const logError = () => {
  console.log('Cookies:', Cookies.get())
  console.log('Session:', localStorage)
}
