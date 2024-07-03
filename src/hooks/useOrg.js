import { useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'

import { GetOrgName } from 'graphQL/Queries'

const useOrg = () => {
  const location = useLocation()
  const { data, loading } = useQuery(GetOrgName, {
    skip: location?.pathname === '/auth'
  })
  return { data, loading }
}

export default useOrg
