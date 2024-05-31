import { useQuery } from '@apollo/client'

import {
  Divider,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tag,
  Text
} from '@chakra-ui/react'

import { GetSelectedUser } from 'graphQL/Queries'

const UserTag = ({ children }) => (
  <Tag
    py={1}
    ml={'auto'}
    size='sm'
    variant='subtle'
    colorScheme={'blue'}
    wordBreak={'break-all'}
    textAlign={'right'}
  >
    {children}
  </Tag>
)

const UserCard = ({ name, isOpen, onClose }) => {
  const isSystem = name === 'system'
  const { data } = useQuery(GetSelectedUser, {
    variables: { search: name },
    skip: name === '' || isSystem ? true : false
  })
  const { users } = data?.organization || ''
  const currentUser = users?.find((item) => item?.name === name)
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>User Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={2} py={3}>
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Name</Text>
              <UserTag>
                {isSystem ? 'System' : currentUser?.name || '-'}
              </UserTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Email</Text>
              <UserTag>{currentUser?.email || '-'}</UserTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Role</Text>
              <UserTag>{currentUser?.role?.name || '-'}</UserTag>
            </Grid>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default UserCard
