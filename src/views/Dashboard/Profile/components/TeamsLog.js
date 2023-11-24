import { useMutation } from '@apollo/client'
import { AddIcon } from '@chakra-ui/icons'
import {
  IconButton,
  Input,
  Stack,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import TeamTable from 'components/Tables/TeamTable'
import { createOrgUser } from 'graphQL/Mutation'
import { useRef, useState } from 'react'

const TeamsLog = ({ data, refetch }) => {
  const toast = useToast()
  const teamRef = useRef()
  const [user, setUser] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return emailRegex.test(email)
  }

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
      })
        .then((res) => {
          if (res.data.userCreate.errors.length > 0) {
            setError(res.data.userCreate.errors[0])
          } else {
            toast({
              description: 'User added successfully',
              status: 'success',
              position: 'top',
              duration: 2000
            })
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.log(`Error`, error)
    }
  }

  return (
    <>
      <Card p={0}>
        <CardHeader>
          <HStack
            width={'100%'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            {/* SEARCH */}
            <Input
              placeholder='Search'
              width={'400px'}
              size='md'
              id='vulnerabilities'
            />
            {/* ADD MEMBER */}
            <Tooltip label='Add Member' placement='top'>
              <IconButton
                ref={teamRef}
                onClick={() => {
                  setUser('')
                  setEmail('')
                  setError('')
                  onOpen()
                }}
                icon={<AddIcon />}
                colorScheme='blue'
                variant='solid'
                fontWeight='normal'
                fontSize={'sm'}
              />
            </Tooltip>
          </HStack>
        </CardHeader>
        <CardBody py={4}>
          <TeamTable data={data} refetch={refetch} />
        </CardBody>
      </Card>

      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Member</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack direction={'column'} alignItems={'flex-start'} spacing={4}>
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
                  isInvalid={
                    (!validateEmail(email) && email !== '') || error !== ''
                  }
                >
                  <FormLabel>Email</FormLabel>
                  <Input
                    type='text'
                    value={email}
                    textTransform={'lowercase'}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {email !== '' && !validateEmail(email) && (
                    <FormErrorMessage>Email is invalid</FormErrorMessage>
                  )}
                  {error !== '' && <FormErrorMessage>{error}</FormErrorMessage>}
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
      )}
    </>
  )
}

export default TeamsLog
