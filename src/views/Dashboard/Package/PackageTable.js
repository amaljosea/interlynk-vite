import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { timeSince, truncatedValue } from 'utils'
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
  paginationProps,
  isOverrides
}) => {
  const { showToast } = useCustomToast()

  const [activeRow, setActiveRow] = useState(null)
  const [searchText, setSearchText] = useState(filters.search || '')

  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    setSearchText(filters.search || '')
  }, [filters.search])

  const [deleteOverride, { loading: deleting }] = useMutation(
    OrganizationPackageVersionDelete,
    {
      refetchQueries: ['PackageData']
    }
  )

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
        id: 'NAME',
        name: 'NAME',
        width: '25%',
        wrap: true,
        selector: (row) => (
          <Flex gap={2} flexDirection={'row'} my={6} alignItems='center'>
            <Tooltip label={row?.packageName}>
              <Text
                fontSize={14}
                fontWeight={'medium'}
                color={primaryTextColor}
              >
                {truncatedValue(row?.packageName, 40)}
              </Text>
            </Tooltip>
            {isOverrides && (
              <>
                <LynkSeparator />
                <LynkBadge color='blue' title='Override' />
              </>
            )}
          </Flex>
        )
      },
      // ECOSYSTEM
      {
        id: 'ECOSYSTEM',
        name: 'ECOSYSTEM',
        wrap: true,
        selector: (row) => {
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {row?.ecosystem || 'N/A'}
            </Text>
          )
        }
      },
      // VERSION
      {
        id: 'VERSION',
        name: 'VERSION',
        wrap: true,
        selector: (row) => {
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {row?.version || 'N/A'}
            </Text>
          )
        }
      },
      // LICENSE
      {
        id: 'LICENSE',
        name: 'LICENSE',
        wrap: true,
        selector: (row) => {
          const license = isOverrides ? row.licenseOverride : row.licensesExp
          return (
            <Tooltip label={license}>
              <Text fontSize={14} color={primaryTextColor}>
                {truncatedValue(license, 20) || 'N/A'}
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
          const copyright = isOverrides ? row.copyrightOverride : row.copyright
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {truncatedValue(copyright, 20) || 'N/A'}
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
          const notice = isOverrides ? row.noticeOverride : row.notice
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {truncatedValue(notice, 20) || 'N/A'}
            </Text>
          )
        }
      },

      // PUBLISHED
      {
        id: 'UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => {
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {timeSince(row.updatedAt)}
            </Text>
          )
        },
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
                  hidden={isOverrides}
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Create override
                </MenuItem>
                <MenuItem
                  data-testid='update_override'
                  hidden={!isOverrides}
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Update override
                </MenuItem>
                <MenuItem
                  data-testid='delete_override'
                  hidden={!isOverrides}
                  onClick={() => handleDeleteOverride(row.id)}
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
    [primaryTextColor, deleting, handleDeleteOverride, onOpen, isOverrides]
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
        <RefreshBtn queries={['PackageData']} />
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
          isOverride={isOverrides}
        />
      )}
    </>
  )
}

export default PackageTable
