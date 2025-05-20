import { useQuery } from '@apollo/client'

import { Divider, Grid, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import { GetSelectedUser } from 'graphQL/Queries'

import { LuInfo } from 'react-icons/lu'

import CustomTag from './CustomTag'

const UserCard = ({ name, isOpen, onClose }) => {
  const isSystem = name === 'system'
  const { data, loading } = useQuery(GetSelectedUser, {
    skip: isOpen ? false : true
  })
  const { nodes } = data?.organization?.users || {}
  const currentUser = nodes?.find((item) => item?.name?.includes(name))
  return (
    <LynkModal
      maxW={'500px'}
      isOpen={isOpen}
      onClose={onClose}
      title={'User Details'}
      Icon={LuInfo}
      noFooter
    >
      {loading ? (
        <CustomLoader />
      ) : (
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
      )}
    </LynkModal>
  )
}

export default UserCard
