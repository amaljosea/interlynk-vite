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
import GlobalContext from 'context/GlobalContext'
import { useContext } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'
import { customStyles } from 'utils'

const VersionTable = ({ data, name, productId }) => {
  const { setActiveProdTab } = useContext(GlobalContext)

  // COLUMNS
  const columns = [
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { primaryComponent, id, creationAt } = row
        return (
          <Link
            to={`/vendor/products/${name}?id=${productId}&sbom=${id}`}
            onClick={() => {
              localStorage.setItem(
                'currentSBOM',
                JSON.stringify({
                  version: primaryComponent?.version,
                  id: id
                })
              )
              setActiveProdTab(0)
            }}
          >
            <Text color={'blue.500'} minWidth='100%'>
              {primaryComponent
                ? primaryComponent.version
                : `Uploaded ${getFullDateAndTime(creationAt)}`}
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
            width={8}
            textAlign={'center'}
            variant='subtle'
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
            width={8}
            textAlign={'center'}
            variant='subtle'
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
            <Tooltip label='Critical' placement='top'>
              <Badge
                width={8}
                textAlign='center'
                fontSize={'sm'}
                fontWeight={'medium'}
                variant='subtle'
                colorScheme='red'
                borderRadius='sm'
                cursor={'pointer'}
              >
                {stats?.vulnStats?.critical ? stats.vulnStats.critical : 0}
              </Badge>
            </Tooltip>
            <Tooltip label='High' placement='top'>
              <Badge
                width={8}
                textAlign='center'
                fontSize={'sm'}
                fontWeight={'medium'}
                variant='subtle'
                colorScheme='orange'
                borderRadius='sm'
                cursor={'pointer'}
              >
                {stats?.vulnStats?.high ? stats.vulnStats.high : 0}
              </Badge>
            </Tooltip>
            <Tooltip label='Medium' placement='top'>
              <Badge
                width={8}
                textAlign='center'
                fontSize={'sm'}
                fontWeight={'medium'}
                variant='subtle'
                colorScheme='yellow'
                borderRadius='sm'
                cursor={'pointer'}
              >
                {stats?.vulnStats?.medium ? stats.vulnStats.medium : 0}
              </Badge>
            </Tooltip>
            <Tooltip label='Low' placement='top'>
              <Badge
                width={8}
                textAlign='center'
                fontSize={'sm'}
                fontWeight={'medium'}
                variant='subtle'
                colorScheme='green'
                borderRadius='sm'
                cursor={'pointer'}
              >
                {stats?.vulnStats?.low ? stats.vulnStats.low : 0}
              </Badge>
            </Tooltip>
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
                <MenuItem>Delete Version</MenuItem>
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
