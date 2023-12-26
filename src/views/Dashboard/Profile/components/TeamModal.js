import { useMutation } from '@apollo/client'
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
  Text
} from '@chakra-ui/react'
import { createOrgUser } from 'graphQL/Mutation'
import { useState } from 'react'
import { validateEmail } from 'utils'

const TeamModal = ({ isOpen, onClose, refetch }) => {
  const toast = useToast()
  const [user, setUser] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const [createUser] = useMutation(createOrgUser, {
    onCompleted: () => refetch()
  })

  const handleAdd = async () => {
    try {
      await createUser({
        variables: {
          name: user,
          email: email.toLowerCase()
        }
      }).then((res) => {
        if (res.data.userCreate.errors.length > 0) {
          setError(res.data.userCreate.errors[0])
        } else {
          toast({
            description: 'User added successfully',
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
        <ModalHeader>Add Member</ModalHeader>
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
            <FormControl isRequired>
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
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant='solid'
            colorScheme='blue'
            disabled={user === '' || !validateEmail(email)}
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
