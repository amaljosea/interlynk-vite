import { useMutation } from '@apollo/client'
import { useCallback, useMemo, useState } from 'react'
import { getFullDate, timeSince, truncatedValue } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkBadge from 'components/LynkBadge'
import LynkSeparator from 'components/LynkSeparator'
import LynkTable from 'components/LynkTable'
import LynkAction from 'components/Misc/LynkAction'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { OrganizationPackageVersionDelete } from 'graphQL/Mutation'

import PackageVersionOverrideModal from './PackageVersionOverrideModal'

const PackageTable = ({
  data,
  loading,
  filters,
  setFilters,
  paginationProps
}) => {
  const { showToast } = useCustomToast()

  const [activeRow, setActiveRow] = useState(null)
  const [searchText, setSearchText] = useState(filters.search || '')

  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

  const [deleteOverride, { loading: deleting }] = useMutation(
    OrganizationPackageVersionDelete
  )

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleClear = useCallback(() => {
    setSearchText('')
    setFilters((prev) => ({ ...prev, search: undefined }))
  }, [setFilters])

  const handleSearch = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        setFilters((prev) => ({
          ...prev,
          search: searchText.trim() || undefined
        }))
      }
    },
    [setFilters, searchText]
  )

  const handleSort = useCallback(
    (column, direction) => {
      if (column?.id && direction) {
        setFilters((prev) => ({
          ...prev,
          orderBy: { field: column.id, direction: direction.toUpperCase() }
        }))
      }
    },
    [setFilters]
  )

  const handleDeleteOverride = useCallback(
    async (overrideId) => {
      try {
        const { data } = await deleteOverride({ variables: { id: overrideId } })
        const errors = data.organizationPackageVersionDelete.errors
        if (errors?.length) {
          showToast({
            title: 'Error deleting override',
            description: errors.join(', '),
            status: 'error'
          })
        } else {
          showToast({
            title: 'Override deleted',
            description: 'The override has been successfully deleted.',
            status: 'success'
          })
        }
      } catch (error) {
        showToast({
          title: 'Error',
          description: error.message,
          status: 'error'
        })
      }
    },
    [deleteOverride, showToast]
  )

  const columns = useMemo(
    () => [
      {
        id: 'UPDATED_AT',
        name: 'NAME',
        width: '25%',
        wrap: true,
        selector: (row) => (
          <Flex gap={2} flexDirection={'column'} my={4}>
            <Tooltip label={row?.package?.name}>
              <Text
                fontSize={14}
                fontWeight={'medium'}
                color={primaryTextColor}
              >
                {truncatedValue(row?.package?.name, 40)}
              </Text>
            </Tooltip>
            <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
              {row?.organizationPackageVersion && (
                <>
                  <LynkBadge color='blue' title='Override' />
                  <LynkSeparator />
                  <Tooltip
                    label={getFullDate(
                      row.organizationPackageVersion?.updatedAt
                    )}
                  >
                    <Text fontSize={14} color={secondaryTextColor}>
                      {timeSince(row.organizationPackageVersion?.updatedAt)}
                    </Text>
                  </Tooltip>
                </>
              )}
            </Flex>
          </Flex>
        ),
        sortable: true
      },
      // ECOSYSTEM
      {
        id: 'ECOSYSTEM',
        name: 'ECOSYSTEM',
        wrap: true,
        selector: (row) => {
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {row?.package?.ecosystem || 'N/A'}
            </Text>
          )
        }
      },
      // VERSION
      {
        id: 'PACKAGE_VERSIONS_VERSION',
        name: 'VERSION',
        wrap: true,
        selector: (row) => {
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {row?.version || 'N/A'}
            </Text>
          )
        },
        sortable: true
      },
      // LICENSE
      {
        id: 'LICENSE',
        name: 'LICENSE',
        wrap: true,
        selector: (row) => {
          const { licenseExp } = row
          if (licenseExp?.startsWith(' OR') || licenseExp?.startsWith('OR')) {
            return (
              <Text fontSize={14} color={primaryTextColor}>
                N/A
              </Text>
            )
          }
          return (
            <Tooltip label={licenseExp}>
              <Text fontSize={14} color={primaryTextColor}>
                {truncatedValue(licenseExp, 20) || 'N/A'}
              </Text>
            </Tooltip>
          )
        }
      },
      // COPYRIGHT
      {
        id: 'COPYRIGHT',
        name: 'COPYRIGHT',
        wrap: true,
        selector: (row) => {
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {truncatedValue(row?.copyright, 20) || 'N/A'}
            </Text>
          )
        }
      },
      // NOTICE
      {
        id: 'NOTICE',
        name: 'NOTICE',
        wrap: true,
        selector: (row) => {
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {truncatedValue(row?.notice, 20) || 'N/A'}
            </Text>
          )
        }
      },

      // PUBLISHED
      {
        id: 'PACKAGE_VERSIONS_PUBLISHED_AT',
        name: 'PUBLISHED',
        selector: (row) => {
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {timeSince(row.updatedAt)}
            </Text>
          )
        },
        sortable: true,
        sortFunction: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
        wrap: true
      },
      {
        id: 'actions',
        name: 'ACTIONS',
        selector: (row) => (
          <Menu>
            <LynkAction data-testid='package_actions' />
            <Portal>
              <MenuList fontSize='sm'>
                <MenuItem
                  data-testid='create_override'
                  hidden={row?.organizationPackageVersion}
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Create override
                </MenuItem>
                <MenuItem
                  data-testid='update_override'
                  hidden={!row?.organizationPackageVersion}
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Update override
                </MenuItem>
                <MenuItem
                  data-testid='delete_override'
                  hidden={!row?.organizationPackageVersion}
                  onClick={() =>
                    handleDeleteOverride(row?.organizationPackageVersion.id)
                  }
                  isDisabled={deleting}
                >
                  Delete override
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        ),
        right: 'true'
      }
    ],
    [
      primaryTextColor,
      secondaryTextColor,
      deleting,
      handleDeleteOverride,
      onOpen
    ]
  )

  const subHeader = useMemo(
    () => (
      <Flex gap={2} width={'100%'} justifyContent={'space-between'}>
        <SearchFilter
          id='package'
          filterText={searchText}
          onFilter={handleSearch}
          onClear={handleClear}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <RefreshBtn />
      </Flex>
    ),
    [searchText, handleSearch, handleClear]
  )

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          progressPending={loading}
          subHeaderComponent={subHeader}
          columns={columns}
          data={data}
          defaultSortFieldId='UPDATED_AT'
          onSort={handleSort}
        />
      </Flex>
      {/* PAGINATION */}
      <Pagination {...paginationProps} />

      {isOpen && (
        <PackageVersionOverrideModal
          onClose={onClose}
          isOpen={isOpen}
          data={activeRow}
        />
      )}
    </>
  )
}

export default PackageTable
