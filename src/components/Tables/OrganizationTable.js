import { gql, useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import { Stack, useDisclosure } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import Pagination from 'components/Pagination'
import OrganizationColumns from 'components/columns/OrganizationColumns'
import OrganizationHeader from 'components/headers/OrganizationHeader'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { SwitchOrganization } from 'graphQL/Mutation'

const GetMyOrganizations = gql`
  query GetMyOrganizations(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $invitationStatuses: [OrgUserInvitationStatuses!]
  ) {
    myOrganizations(
      invitationStatuses: $invitationStatuses
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      totalCount
      nodes {
        email
        id
        name
        status
        tier
        updatedAt
        url
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`
const GetAllOrganizations = gql`
  query GetAllOrganizations(
    $status: OrganizationStatusEnum
    $tier: OrganizationTierEnum
    $orderBy: OrganizationOrderByInput
    $search: String
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    allOrganizations(
      status: $status
      tier: $tier
      orderBy: $orderBy
      search: $search
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        email
        id
        name
        status
        tier
        updatedAt
        url
      }
    }
  }
`

const OrganizationTable = () => {
  const navigate = useNavigate()
  const { organization } = useGlobalState()
  const isSuperAdmin = organization?.currentUser?.superAdmin
  const CREATE = useDisclosure()

  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({
    tier: '',
    status: '',
    search: '',
    orderBy: { field: 'ORGANIZATIONS_CREATED_AT', direction: 'DESC' }
  })
  const { search, tier, status, orderBy } = filters || {}

  const [switchOrg] = useMutation(SwitchOrganization)

  const {
    reset,
    nodes: allOrgs,
    loading: allOrgLoading,
    paginationProps: allPaginationProps
  } = usePaginatedQuery(GetAllOrganizations, {
    selector: 'allOrganizations',
    skip: isSuperAdmin ? false : true,
    variables: {
      orderBy,
      tier: tier !== '' ? tier : undefined,
      search: search !== '' ? search : undefined,
      status: status !== '' ? status : undefined
    }
  })

  const {
    nodes: myOrgs,
    loading: myOrgLoading,
    paginationProps: myPaginationProps
  } = usePaginatedQuery(GetMyOrganizations, {
    selector: 'myOrganizations',
    skip: isSuperAdmin ? true : false,
    variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
  })

  const nodes = isSuperAdmin ? allOrgs : myOrgs
  const loading = isSuperAdmin ? allOrgLoading : myOrgLoading
  const paginationProps = isSuperAdmin ? allPaginationProps : myPaginationProps

  const handleSwitch = async (item) => {
    await switchOrg({ variables: { orgId: item?.id } })
      .then((res) => {
        if (res?.data) {
          Cookies.set('authToken', res.data.organizationSwitch.token)
        }
      })
      .finally(() => {
        setTimeout(() => {
          navigate('/vendor/dashboard')
          window.location.reload()
        }, 100)
      })
  }

  const action = (type, data) => {
    switch (type) {
      case 'add_organization':
        return CREATE.onOpen()
      case 'switch_organization':
        return handleSwitch(data)
      default:
        return CREATE.onOpen()
    }
  }

  const handleClear = useCallback(async () => {
    setSearchInput('')
    setFilters((prev) => ({ ...prev, search: '' }))
  }, [])

  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setSearchInput(value)
      }
    },
    [handleClear]
  )

  const handleSearch = useCallback(
    async (event) => {
      const { value } = event.target
      if (event.key === 'Enter') {
        setFilters((prev) => ({ ...prev, search: value }))
        reset()
      }
    },
    [reset]
  )

  const handleSort = (column, sortDirection) => {
    setFilters((prev) => ({
      ...prev,
      orderBy: {
        field: column?.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    }))
  }

  const columns = OrganizationColumns({ action })
  const subHeader = OrganizationHeader({
    action,
    filters,
    setFilters,
    searchInput,
    handleClear,
    handleSearch,
    onSearchInputChange
  })

  return (
    <>
      <Stack>
        <LynkTable
          subHeader
          columns={columns}
          data={nodes || []}
          onSort={handleSort}
          progressPending={loading}
          subHeaderComponent={subHeader}
          defaultSortFieldId={orderBy?.field}
          defaultSortAsc={orderBy?.direction === 'ASC' ? true : false}
        />
        <Pagination {...paginationProps} />
      </Stack>

      {CREATE.isOpen && (
        <OrgModal isOpen={CREATE.isOpen} onClose={CREATE.onClose} />
      )}
    </>
  )
}

export default OrganizationTable
