import { Avatar, Box, Flex, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import DataTable from 'react-data-table-component'
import { getFullDateAndTime } from 'utils'
import { displayPic } from 'utils'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  }
}

const TeamTable = ({ data }) => {
  const columns = [
    // NAME
    {
      id: 'name',
      name: 'NAME',
      selector: (row) => {
        const { name, email } = row
        return (
          <Stack
            width={'100%'}
            px={0}
            py='.8rem'
            direction={'row'}
            alignItems={'flex-center'}
          >
            <Box width={'30px'}>
              <Avatar me={{ md: '22px' }} src={displayPic(email)} w='30px' h='30px' />
            </Box>
            <Box
              display={'flex'}
              flexWrap={'wrap'}
              flexDirection={'column'}
              gap={1}
            >
              <Text fontSize={'14px'}>{name}</Text>
              <Text color={'#666'}>{email}</Text>
            </Box>
          </Stack>
        )
      },
      width: '300px'
    },
    // AUTH
    {
      id: 'email',
      name: 'EMAIL',
      selector: (row) => row.email
    },
    // ROLE
    {
      id: 'role',
      name: 'ROLE',
      selector: (row) => row.role
    },
    // JOINED DATE
    {
      id: 'joinedDate',
      name: 'DATE JOINED',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Text textTransform={'capitalize'}>
            {getFullDateAndTime(createdAt)}
          </Text>
        )
      }
    }
  ]

  return (
    <>
      {data.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={customStyles}
            progressPending={data.length === 0}
            responsive={true}
          />
        </Flex>
      ) : (
        <Flex
          width={'100%'}
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Text>No team data found</Text>
        </Flex>
      )}
    </>
  )
}

export default TeamTable
