import { useQuery } from '@apollo/client'
import { getSignedUrlParams } from 'utils'

import {
  AllOrganizationsTotalCount,
  MyOrganizationsTotalCount
} from 'graphQL/Queries'

import { useGlobalState } from './useGlobalState'

export const useFetchOrganizationsCount = () => {
  const { organization } = useGlobalState()
  const signedUrlParams = getSignedUrlParams()

  const isSuperAdmin = organization?.currentUser?.superAdmin

  const { data: allOrgsCount } = useQuery(AllOrganizationsTotalCount, {
    skip: isSuperAdmin === true ? false : true,
    variables: { first: 100, status: 'approved' }
  })
  const { data: myOrgsCount } = useQuery(MyOrganizationsTotalCount, {
    skip:
      isSuperAdmin ||
      signedUrlParams ||
      location.pathname.startsWith('/customer'),
    variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
  })

  const totalMyOrganizations = myOrgsCount?.myOrganizations?.totalCount ?? 0
  const totalAllOrganizations = allOrgsCount?.allOrganizations?.totalCount ?? 0

  return isSuperAdmin ? totalAllOrganizations : totalMyOrganizations
}
