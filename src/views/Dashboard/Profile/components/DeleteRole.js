import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import {
  OrganizationRoleBulkApply,
  OrganizationRoleDelete
} from 'graphQL/Mutation'
import { GetRoles, GetUsers } from 'graphQL/Queries'

const DeleteRole = ({ isOpen, onClose, activeRole }) => {
  const { showToast } = useCustomToast()
  const { orgView } = useGlobalQueryContext()
  const { name, id } = activeRole || ''

  const [role, setRole] = useState('')
  const [error, setError] = useState('')

  const { data: userData } = useQuery(GetUsers, { skip: !orgView })
  const { users } = userData?.organization || ''
  const filterUsers = users?.filter((user) => user?.role?.id === id)
  console.log('filterUsers', filterUsers)

  const [updateUserRole] = useMutation(OrganizationRoleBulkApply)
  const [deleteRole] = useMutation(OrganizationRoleDelete)

  const { data } = useQuery(GetRoles)
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Role</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Flex} flexDirection='column' gap={3}>
          {/* ERROR HANDLING */}
          <Alert status='error' borderRadius={4} hidden={error === ''}>
            <AlertIcon />
            <AlertDescription fontSize={'sm'} pr={2}>
              {error}
            </AlertDescription>
          </Alert>
          <Text>
            This will delete the role and reassign existing users on this role
            to a new role.
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
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='gray' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme='red' onClick={onDelete} isDisabled={isDisabled}>
            Reassign Users and Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteRole
