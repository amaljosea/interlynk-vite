import { Redirect } from 'react-router-dom'

const PrivateRoute = () => {
  const username = console.log(localStorage.getItem(`username`))

  if (username) {
    return <Redirect to='/vendor/dashboard' />
  } else {
    return <Navigate to={'/auth'} />
  }
}

export default PrivateRoute
