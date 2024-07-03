import { refetchActiveQueries } from 'context/ApolloWrapper'
import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'

import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Flex,
  Grid,
  GridItem,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Tag,
  TagLabel,
  Text,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import ViewAlert from 'components/Misc/ViewAlert'

import { useGlobalState } from 'hooks/useGlobalState'

import { FaEllipsisV } from 'react-icons/fa'
import { FaScaleBalanced } from 'react-icons/fa6'

import Pagination from '../Pagination'
import LicenseDrawer from './LicenseDrawer'
import { SubHeaderComponent } from './SubHeaderComponent'

const LicenseTable = ({ licenses, paginationProps, setFilters, loading }) => {
  const [activeRow, setActiveRow] = useState(null)
  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { userPermissions } = useGlobalState()
  const viewLic = userPermissions?.find((item) => item?.key === 'view_license')
  const updateLic = viewLic?.supersededBy?.some(
    (permission) =>
      permission.key === 'edit_license_attributes' && permission?.value === true
  )

  const { isOpen, onOpen, onClose } = useDisclosure()

  const subHeaderComponent = (
    <SubHeaderComponent
      onOpen={onOpen}
      createLic={updateLic}
      setActiveRow={setActiveRow}
      handleRefresh={() => refetchActiveQueries()}
      setFilters={setFilters}
    />
  )
  // COLUMNS
  const columns = [
    // NAME
    {
      id: 'NAME',
      name: 'NAME',
      width: '35%',
      wrap: true,
      selector: ({ content: { name, shortId, url, spdxId } }) => {
        return (
          <Grid templateColumns='repeat(12, 1fr)' gap={2} my={3}>
            <GridItem colSpan={1} width={'50px'}>
              <IconButton
                isRound={true}
                variant='solid'
                colorScheme='gray'
                icon={<FaScaleBalanced color={textColor} fontSize={16} />}
              />
            </GridItem>
            <GridItem
              colSpan={11}
              display={'flex'}
              flexWrap={'wrap'}
              flexDirection={'column'}
              gap={2}
            >
              <Text color={textColor} data-tag='allowRowEvents'>
                {name}
              </Text>
              <Flex flexWrap={'wrap'} gap={2} alignItems={'center'}>
                {(shortId || spdxId) && (
                  <Tag
                    width={'fit-content'}
                    size='sm'
                    variant='subtle'
                    colorScheme='blue'
                  >
                    <TagLabel>{shortId || spdxId}</TagLabel>
                  </Tag>
                )}
                {url && (
                  <Link
                    href={shortId ? url.replace('.json', '.html') : url}
                    isExternal
                    color={'blue.500'}
                    fontSize={'sm'}
                    fontWeight={'normal'}
                    display={'flex'}
                    alignItems={'center'}
                    gap={1}
                  >
                    <ExternalLinkIcon />
                  </Link>
                )}
              </Flex>
            </GridItem>
          </Grid>
        )
      }
    },
    // ATTRIBUTION
    {
      id: 'ATTRIBUTION',
      name: 'ATTRIBUTION',
      width: '11%',
      wrap: true,
      selector: ({ attribution }) => {
        if (!attribution || attribution === 'UNKNOWN') {
          attribution = 'Not Available'
        }
        return (
          <Text color={textColor} textTransform='capitalize'>
            {attribution.toLowerCase()}
          </Text>
        )
      }
    },
    // COPYLEFT
    {
      id: 'COPYLEFT',
      name: 'COPYLEFT',
      width: '11%',
      wrap: true,
      selector: ({ copyLeft }) => {
        if (!copyLeft || copyLeft === 'UNKNOWN') {
          copyLeft = 'Not Available'
        }
        return (
          <Text color={textColor} textTransform='capitalize'>
            {copyLeft.toLowerCase()}
          </Text>
        )
      }
    },
    // REQUIRES SOURCE CODE
    {
      id: 'REQUIRES SOURCE CODE',
      name: 'REQUIRES SOURCE CODE',
      width: '11%',
      wrap: true,
      selector: ({ sourceDistribution }) => {
        if (!sourceDistribution || sourceDistribution === 'UNKNOWN') {
          sourceDistribution = 'Not Available'
        }
        return (
          <Text color={textColor} textTransform='capitalize'>
            {sourceDistribution.toLowerCase()}
          </Text>
        )
      }
    },
    {
      id: 'PERMITS MODIFICATIONS',
      name: 'PERMITS MODIFICATIONS',
      width: '11%',
      wrap: true,
      selector: ({ modifications }) => {
        if (!modifications || modifications === 'UNKNOWN') {
          modifications = 'Not Available'
        }
        return (
          <Text color={textColor} textTransform='capitalize'>
            {modifications.toLowerCase()}
          </Text>
        )
      }
    },
    // STATUS
    {
      id: 'STATUS',
      name: 'STATUS',
      width: '12%',
      wrap: true,
      sortable: true,
      selector: ({ state }) => {
        state = state?.toLowerCase() || 'Not Available'
        return (
          <Tag
            size='md'
            variant='solid'
            colorScheme={
              state === 'approved'
                ? 'green'
                : state === 'rejected'
                  ? 'red'
                  : state === 'unspecified'
                    ? 'orange'
                    : 'blue'
            }
            width={'110px'}
          >
            <TagLabel mx={'auto'} textTransform={'capitalize'}>
              {state}
            </TagLabel>
          </Tag>
        )
      }
    },
    // ACTIONS
    {
      id: 'actions',
      name: 'ACTIONS',
      width: '8%',
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
                {/* Edit License */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                  isDisabled={!updateLic}
                >
                  Edit License
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          progressPending={loading}
          subHeaderComponent={subHeaderComponent}
          columns={columns}
          data={licenses}
          customStyles={customStyles(headColor)}
          defaultSortAsc={false}
          defaultSortFieldId={'UPDATED_AT'}
          progressComponent={<CustomLoader />}
          onSort={(column, sortDirection) => {
            setFilters((oldFilters) => ({
              ...oldFilters,
              direction: sortDirection.toUpperCase()
            }))
          }}
          subHeader
          responsive
          persistTableHead
        />
      </Flex>
      {/* PAGINATION */}
      <Pagination {...paginationProps} />
      {isOpen && (
        <LicenseDrawer isOpen={isOpen} onClose={onClose} data={activeRow} />
      )}
    </>
  )
}

export default LicenseTable
