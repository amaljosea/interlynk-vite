import { useQuery } from '@apollo/client'

import { GetOrgName } from 'graphQL/Queries'

const useOrg = () => {
  const { data, loading } = useQuery(GetOrgName)
  return { data, loading }
}

export default useOrg
