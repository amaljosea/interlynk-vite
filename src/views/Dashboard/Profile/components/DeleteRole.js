import { gql, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'

import { Flex, FormControl, Select, Text } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import {
  OrganizationRoleBulkApply,
  OrganizationRoleDelete
} from 'graphQL/Mutation'
import { GetRoles } from 'graphQL/Queries'

import { BiTrash } from 'react-icons/bi'

const GetUsers = gql`
  query Organization {
    organization {
      users {
        totalCount
        nodes {
          id
          role {
            id
          }
        }
      }
    }
  }
`

const DeleteRole = ({ isOpen, onClose, activeRole }) => {
  const { showToast } = useCustomToast()
  const { orgView } = useGlobalQueryContext()
  const { name, id } = activeRole || ''

  const [role, setRole] = useState('')
  const [error, setError] = useState('')

  const { data: userData } = useQuery(GetUsers, { skip: !orgView })
  const users = userData?.organization?.users?.nodes || []
  const filterUsers = users.filter((user) => user?.role?.id === id)

  const [updateUserRole, { loading: updateLoading }] = useMutation(
    OrganizationRoleBulkApply
  )
  const [deleteRole, { loading: deleteLoading }] = useMutation(
    OrganizationRoleDelete
  )

  const { data } = useQuery(GetRoles, { skip: isOpen ? false : true })
  const { organizationRoles } = data?.organization || ''

  const filterRoles = organizationRoles?.filter((item) => item?.name !== name)

  const onSuccess = () => {
    showToast({
      description: 'Role deleted successfully',
      status: 'success'
    })
    onClose()
  }

  const updateRole = () => {
    const ids = filterUsers?.map((item) => item?.id)
    updateUserRole({
      variables: {
        userIds: ids,
        organizationRoleId: role
      }
    }).then((res) => {
      if (res?.data?.organizationRoleBulkApply?.errors?.length > 0) {
        setError(res?.data?.organizationRoleBulkApply?.errors[0])
      } else {
        onSuccess()
      }
    })
  }

  const onDelete = () => {
    deleteRole({ variables: { id } }).then((res) => {
      const { errors } = res?.data?.organizationRoleDelete || ''
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        if (filterUsers?.length > 0) {
          updateRole()
        } else {
          onSuccess()
        }
      }
    })
  }

  const isDisabled = role === '' || error !== ''

  return (
    <LynkModal
      Icon={BiTrash}
      isOpen={isOpen}
      onClose={onClose}
      buttonColor='red'
      onSubmit={onDelete}
      title={'Delete Role'}
      disabled={isDisabled}
      buttonText='Reassign Users and Delete'
      isLoading={deleteLoading || updateLoading}
    >
      {/* ERROR HANDLING */}
      <Flex flexDirection='column' gap={3}>
        {error !== '' && <LynkAlert msg={error} />}
        <Text>
          This will delete the role and reassign existing users on this role to
          a new role.
        </Text>
        <Text>Select the role you wish to move the users to</Text>
        <FormControl display={data ? 'block' : 'none'}>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            textTransform={'capitalize'}
          >
            <option value=''>-- Select --</option>
            {filterRoles?.map((item, index) => (
              <option key={index} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default DeleteRole
