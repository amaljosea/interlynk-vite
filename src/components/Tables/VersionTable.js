import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
  Tooltip,
  Tag,
  Badge
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { customStyles } from 'utils'

const VersionTable = ({ data, name, productId }) => {
  // COLUMNS
  const columns = [
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { primaryComponent, id } = row
        return (
          <Link to={`/vendor/products/${name}?&id=${productId}&sbom=${id}`}>
            <Text color={'blue.500'} minWidth='100%'>
              {primaryComponent?.version}
            </Text>
          </Link>
        )
      },
      wrap: true,
      width: '200px'
    },
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      selector: (row) => {
        const { stats } = row
        return (
          <Badge
            variant='solid'
            borderRadius='sm'
            colorScheme='blue'
            fontSize={'sm'}
            fontWeight={'medium'}
          >
            {stats?.compCount}
          </Badge>
        )
      }
    },
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { stats } = row
        return (
          <Badge
            variant='solid'
            borderRadius='sm'
            colorScheme='blue'
            fontSize={'sm'}
            fontWeight={'medium'}
          >
            {stats?.compLicenseCount}
          </Badge>
        )
      }
    },
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { stats } = row
        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            {stats?.vulnStats?.critical && (
              <Tooltip label='Critical' placement='top'>
                <Badge
                  fontSize={'sm'}
                  fontWeight={'medium'}
                  variant='solid'
                  colorScheme='red'
                  borderRadius='sm'
                  cursor={'pointer'}
                  onClick={() => onFilterSev(part, ['critical'])}
                >
                  {stats?.vulnStats?.critical}
                </Badge>
              </Tooltip>
            )}
            {stats?.vulnStats?.high && (
              <Tooltip label='High' placement='top'>
                <Badge
                  fontSize={'sm'}
                  fontWeight={'medium'}
                  variant='solid'
                  colorScheme='orange'
                  borderRadius='sm'
                  cursor={'pointer'}
                  onClick={() => onFilterSev(part, ['high'])}
                >
                  {stats?.vulnStats?.high}
                </Badge>
              </Tooltip>
            )}
            {stats?.vulnStats?.medium && (
              <Tooltip label='Medium' placement='top'>
                <Badge
                  fontSize={'sm'}
                  fontWeight={'medium'}
                  variant='solid'
                  colorScheme='yellow'
                  borderRadius='sm'
                  cursor={'pointer'}
                  onClick={() => onFilterSev(part, ['medium'])}
                >
                  {stats?.vulnStats?.medium}
                </Badge>
              </Tooltip>
            )}
            {stats?.vulnStats?.low && (
              <Tooltip label='Low' placement='top'>
                <Badge
                  fontSize={'sm'}
                  fontWeight={'medium'}
                  variant='solid'
                  colorScheme='green'
                  borderRadius='sm'
                  cursor={'pointer'}
                  onClick={() => onFilterSev(part, ['low'])}
                >
                  {stats?.vulnStats?.low}
                </Badge>
              </Tooltip>
            )}
          </Stack>
        )
      },
      width: '200px'
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { lifecycle } = row

        return (
          <Tag size='sm' colorScheme='cyan' textTransform={'capitalize'}>
            {lifecycle}
          </Tag>
        )
      }
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem>Remove</MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  return (
    <Flex flexDir={'column'} width={'100%'}>
      <DataTable
        data={data && data.sboms}
        columns={columns}
        responsive={true}
        customStyles={customStyles}
        progressComponent={<CustomLoader />}
        progressPending={data ? false : true}
        persistTableHead
      />
    </Flex>
  )
}

export default VersionTable
