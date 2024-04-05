import axios from 'axios'
import Cookies from 'js-cookie'

export const logoutUser = async () => {
  await logError() // Added for debugging random logouts

  const logoutURL = process.env.REACT_APP_VENDOR_LOGOUT_URL
  const authToken = Cookies.get('authToken')

  try {
    // Attempt to inform the server about the logout
    await axios.delete(`${logoutURL}`, {
      headers: {
        Authorization: authToken
      }
    })
  } catch (error) {
    console.error('Logout failed')
  } finally {
    // Clear client-side storage and cookies regardless of server response
    localStorage.clear()
    sessionStorage.clear()
    Cookies.remove('authToken')
    Cookies.remove('signedParamId')
    Cookies.remove('userToken')
  }
}

const logError = () => {
  console.log('Cookies:', Cookies.get())
  console.log('Session:', localStorage)
}
