import { useMutation, useQuery } from '@apollo/client'
import {
  Input,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Alert,
  AlertIcon,
  Text,
  Select
} from '@chakra-ui/react'
import { InviteUser, createOrgUser } from 'graphQL/Mutation'
import { GetRoles } from 'graphQL/Queries'
import { useState } from 'react'
import { validateEmail } from 'utils'

const TeamModal = ({ isOpen, onClose, refetch }) => {
  const toast = useToast()
  const [user, setUser] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
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
            {/* NAME */}
            <FormControl isRequired display={'none'}>
              <FormLabel>Name</FormLabel>
              <Input
                type='text'
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </FormControl>
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
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
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
            disabled={!validateEmail(email)}
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
