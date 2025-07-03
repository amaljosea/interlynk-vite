import { useMutation } from '@apollo/client'
import React, { useCallback, useState } from 'react'
import RoleModal from 'views/Dashboard/Profile/components/RoleModal'
import TeamModal from 'views/Dashboard/Profile/components/TeamModal'

import { Stack, Text, useDisclosure } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkTable from 'components/LynkTable'
import Pagination from 'components/Pagination'
import TeamColumns from 'components/columns/TeamColumns'
import TeamHeader from 'components/headers/TeamHeader'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

import { InviteUser, deleteOrgUser } from 'graphQL/Mutation'
import { GetUsers } from 'graphQL/Queries'

import { LuUserRoundX } from 'react-icons/lu'

const TeamTable = () => {
  const activetab = useQueryParam('tab')
  const { showToast } = useCustomToast()
  const { organization } = useGlobalState()

  const { currentUser } = organization || {}

  const USER = useDisclosure()
  const TEAM = useDisclosure()
  const ROLE = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [filterText, setFilterText] = useState('')
  const [deleteUser, { loading: deleteLoading }] = useMutation(deleteOrgUser, {
    refetchQueries: ['GetUsers']
  })

  const [inviteUsers] = useMutation(InviteUser, {
    refetchQueries: ['GetUsers']
  })

  const { nodes, loading, paginationProps } = usePaginatedQuery(GetUsers, {
    selector: 'organization.users',
    skip: !organization ? true : activetab === 'users' ? false : true,
    variables: { search: filterText === '' ? undefined : filterText }
  })

  const numberOfUsers = nodes?.length

  const onResendInvite = async (row) => {
    await inviteUsers({
      variables: {
        email: row?.email,
        roleId: row?.role?.id
      }
    }).then((res) => {
      if (res?.data?.organizationUserInvite?.errors?.length > 0) {
        showToast({
          description: res?.data?.organizationUserInvite?.errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Invitation sent successfully',
          status: 'success'
        })
      }
    })
  }

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'change_role':
        return ROLE.onOpen()
      case 'revoke_invitation':
        return USER.onOpen()
      case 'resend_invite':
        return onResendInvite(data)
      case 'add_user':
        return TEAM.onOpen()
    }
  }

  const editUserRole = useHasPermission({
    parentKey: 'view_users',
    childKey: 'edit_user_role'
  })

  // CLEAR SEARCH
  const handleClear = useCallback(async () => {
    setSearchInput('')
    setFilterText('')
  }, [])

  // ON SEARCH INPUT CHANGE
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

  // SEARCH COMPONENT
  const handleSearch = useCallback(async (event) => {
    const { value } = event.target
    if (event.key === 'Enter') {
      setFilterText(value)
    }
  }, [])

  // COLUMNS
  const columns = TeamColumns({ action })

  // HEADER SECTION
  const subHeader = TeamHeader({
    action,
    searchInput,
    handleClear,
    handleSearch,
    onSearchInputChange,
    numberOfUsers
  })

  const handleRemove = async () => {
    await deleteUser({
      variables: {
        userId: activeRow.id
      }
    })
      .then((res) => res.data)
      .finally(() => USER.onClose())
  }

  return (
    <>
      <LynkTable
        subHeader
        columns={columns}
        data={nodes || []}
        progressPending={loading}
        subHeaderComponent={subHeader}
        defaultSortFieldId={'joinedDate'}
      />

      <Pagination {...paginationProps} />

      {/* ADD / UPDATE User */}
      {TEAM.isOpen && (
        <TeamModal
          data={currentUser}
          isOpen={TEAM.isOpen}
          onClose={TEAM.onClose}
          changeRole={editUserRole}
        />
      )}

      {/* UPDATE User ROLE */}
      {ROLE.isOpen && (
        <RoleModal
          data={activeRow}
          isOpen={ROLE.isOpen}
          onClose={ROLE.onClose}
        />
      )}

      {/* REMOVE User */}
      {USER.isOpen && activeRow && (
        <LynkModal
          Icon={LuUserRoundX}
          buttonColor='red'
          buttonText='Remove'
          isOpen={USER.isOpen}
          title={'Remove User'}
          onClose={USER.onClose}
          onSubmit={handleRemove}
          isLoading={deleteLoading}
        >
          <Stack
            spacing={2}
            sx={{ gap: 2, direction: 'column', alignItems: 'flex-start' }}
          >
            <Text fontWeight={300} fontSize={16} lineHeight={'30px'}>
              Are you sure you want to remove the following user from the
              organization ?
            </Text>
            <Text
              sx={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '30px',
                wordBreak: 'break-all'
              }}
            >
              {activeRow.name} {`(${activeRow.email})`}
            </Text>
          </Stack>
        </LynkModal>
      )}
    </>
  )
}

export default TeamTable
