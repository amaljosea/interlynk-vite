import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { validateEmail } from 'utils'

import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
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
  Text,
  useToast
} from '@chakra-ui/react'

import { InviteUser } from 'graphQL/Mutation'
import { GetRoles } from 'graphQL/Queries'

const TeamModal = ({ isOpen, onClose, refetch, data, changeRole }) => {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(data?.role?.id)
  const [error, setError] = useState('')

  const { data: roles } = useQuery(GetRoles)

  const [inviteUsers] = useMutation(InviteUser, {
    onCompleted: () => refetch()
  })

  const handleAdd = async () => {
    try {
      await inviteUsers({
        variables: {
          email: email.toLowerCase(),
          roleId: role || undefined
        }
      }).then((res) => {
        if (res.data.organizationUserInvite.errors.length > 0) {
          setError(res.data.organizationUserInvite.errors[0])
        } else {
          toast({
            description: 'Invitation sent successfully',
            status: 'success',
            position: 'top',
            duration: 2000
          })
          onClose()
        }
      })
    } catch (error) {
      console.log(`Error`, error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invite User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack direction={'column'} alignItems={'flex-start'} spacing={4}>
            {error !== '' && (
              <Alert status='error' borderRadius={4}>
                <AlertIcon />
                <Text fontSize={'sm'}>{error}</Text>
              </Alert>
            )}
            {/* EMAIL */}
            <FormControl
              isRequired
              isInvalid={email !== '' && !validateEmail(email)}
            >
              <FormLabel>Email</FormLabel>
              <Input
                type='text'
                value={email}
                textTransform={'lowercase'}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
              />
              {email !== '' && !validateEmail(email) && (
                <FormErrorMessage>Email is invalid</FormErrorMessage>
              )}
            </FormControl>
            {/* ROLES */}
            {roles && (
              <FormControl isDisabled={!changeRole}>
                <FormLabel>Role</FormLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  textTransform='capitalize'
                >
                  <option value=''>-- Select --</option>
                  {roles?.organization?.organizationRoles.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.name}
                    </option>
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
            disabled={!validateEmail(email) || role === ''}
            onClick={handleAdd}
          >
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TeamModal
