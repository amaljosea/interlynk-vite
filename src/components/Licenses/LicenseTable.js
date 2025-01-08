import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, truncatedValue } from 'utils'
import { parseLicenseString } from 'utils'

import {
  Flex,
  IconButton,
  Portal,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ExternalNavIcon from 'components/Icons/ExternalNavIcon'
import LynkAction from 'components/Misc/LynkAction'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaScaleBalanced } from 'react-icons/fa6'

import Pagination from '../Pagination'
import LicenseDrawer from './LicenseDrawer'
import { SubHeaderComponent } from './SubHeaderComponent'

const LicenseTable = ({ licenses, paginationProps, setFilters, loading }) => {
  const [activeRow, setActiveRow] = useState(null)
  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const updateLic = useHasPermission({
    parentKey: 'view_license',
    childKey: 'edit_license_attributes'
  })

  const { isOpen, onOpen, onClose } = useDisclosure()

  const subHeaderComponent = (
    <SubHeaderComponent
      onOpen={onOpen}
      createLic={updateLic}
      setActiveRow={setActiveRow}
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
      selector: ({ content: { name, shortId, url, spdxId, __typename } }) => {
        const displayName =
          __typename === 'LicenseCustom' ? parseLicenseString(name) : name

        const tagValue =
          __typename === 'LicenseCustom'
            ? parseLicenseString(shortId || spdxId)
            : shortId || spdxId

        return (
          <Grid templateColumns='repeat(12, 1fr)' gap={2} my={3}>
            <GridItem colSpan={1} width={'50px'}>
              <IconButton
                isRound={true}
                variant='solid'
                colorScheme='gray'
                icon={
                  <FaScaleBalanced color={primaryTextColor} fontSize={16} />
                }
              />
            </GridItem>
            <GridItem
              colSpan={11}
              display={'flex'}
              flexWrap={'wrap'}
              flexDirection={'column'}
              gap={2}
            >
              <Text
                wordBreak={'break-all'}
                color={primaryTextColor}
                data-tag='allowRowEvents'
                data-testid={`license_${name}`}
              >
                {displayName}
              </Text>
              <Flex flexWrap={'wrap'} gap={2} alignItems={'center'}>
                {tagValue && (
                  <Tooltip label={shortId || spdxId}>
                    <Tag
                      width={'fit-content'}
                      size='sm'
                      variant='subtle'
                      colorScheme='blue'
                    >
                      <TagLabel>{truncatedValue(tagValue, 45)}</TagLabel>
                    </Tag>
                  </Tooltip>
                )}
                {url && (
                  <ExternalNavIcon
                    href={shortId ? url.replace('.json', '.html') : url}
                  />
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
          <Text color={primaryTextColor} textTransform='capitalize'>
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
          <Text color={primaryTextColor} textTransform='capitalize'>
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
          <Text color={primaryTextColor} textTransform='capitalize'>
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
          <Text color={primaryTextColor} textTransform='capitalize'>
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
            variant='subtle'
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
            <LynkAction aria-label={`license action ${row?.content?.name}`} />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* Edit License */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                  aria-label={`license edit ${row?.content?.name}`}
                >
                  {!updateLic ? 'View' : 'Edit'} License
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
          customStyles={customStyles(headingTextColor)}
          defaultSortAsc={false}
          defaultSortFieldId={'UPDATED_AT'}
          progressComponent={<CustomLoader />}
          onSort={(column, sortDirection) => {
            setFilters((oldFilters) => ({
              ...oldFilters,
              orderBy: {
                field: column?.id,
                direction: sortDirection?.toUpperCase()
              }
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
        <LicenseDrawer
          isOpen={isOpen}
          data={activeRow}
          onClose={onClose}
          updateLic={updateLic}
        />
      )}
    </>
  )
}

export default LicenseTable
