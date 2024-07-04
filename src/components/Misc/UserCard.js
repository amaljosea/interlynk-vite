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
  Text
} from '@chakra-ui/react'

import { GetSelectedUser } from 'graphQL/Queries'

import CustomTag from './CustomTag'

const UserCard = ({ name, isOpen, onClose }) => {
  const isSystem = name === 'system'
  const { data } = useQuery(GetSelectedUser, {
    skip: name === '' || isSystem ? true : false
  })
  const { users } = data?.organization || ''
  const currentUser = users?.find((item) => item?.name?.includes(name))
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
              <CustomTag>
                {isSystem ? 'System' : currentUser?.name || '-'}
              </CustomTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Email</Text>
              <CustomTag>{currentUser?.email || '-'}</CustomTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Role</Text>
              <CustomTag>{currentUser?.role?.name || '-'}</CustomTag>
            </Grid>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default UserCard
