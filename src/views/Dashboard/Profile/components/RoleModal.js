import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text
} from '@chakra-ui/react'

import { UpdateOrganizationUserRole } from 'graphQL/Mutation'
import { GetRoles } from 'graphQL/Queries'

const RoleModal = ({ isOpen, onClose, refetch, data }) => {
  const [role, setRole] = useState(data?.role?.id)
  const [error, setError] = useState('')

  const { data: roles } = useQuery(GetRoles)

  const [updateOrgRules] = useMutation(UpdateOrganizationUserRole, {
    onCompleted: () => refetch()
  })

  const updateRole = async () => {
    await updateOrgRules({
      variables: {
        userId: data?.id,
        organizationRoleId: role
      }
    }).then((res) => {
      if (res?.data?.organizationUserUpdate?.errors.length > 0) {
        setError(res?.data?.organizationUserUpdate?.errors[0])
      } else {
        onClose()
      }
    })
  }

  useEffect(() => {
    if (data) {
      setRole(data?.role?.id)
    }
  }, [data])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Role</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack direction={'column'} alignItems={'flex-start'} spacing={4}>
            {error !== '' && (
              <Alert status='error' borderRadius={4}>
                <AlertIcon />
                <Text fontSize={'sm'}>{error}</Text>
              </Alert>
            )}
            {/* NAME */}
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input type='text' defaultValue={data?.name || ''} isReadOnly />
            </FormControl>
            {/* ROLES */}
            {roles && (
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  textTransform={'capitalize'}
                >
                  <option value=''>-- Select --</option>
                  {roles?.organization?.organizationRoles.map((item) => (
                    <option value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant='solid'
            colorScheme='blue'
            onClick={updateRole}
            disabled={role === ''}
          >
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default RoleModal
