import { client } from 'context/ApolloWrapper'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter, truncatedValue } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Box,
  Button,
  Checkbox,
  Flex,
  IconButton,
  Kbd,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'

import EditButton from 'components/Icons/EditButton'
import LynkBadge from 'components/LynkBadge'
import LynkDrawer from 'components/LynkDrawer'
import LynkTable from 'components/LynkTable'
import MenuHeading from 'components/Misc/MenuHeading'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetAttributionsData } from 'graphQL/Queries'

import {
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuCircleSlash,
  LuCircleX,
  LuEye
} from 'react-icons/lu'

import { downloadAttributionHtml } from './AttributionHtml'
import AttributionReportsEditModal from './AttributionReportsEditModal'
import LicenseFilterMenu from './LicenseFilterMenu'
import { generateAttributionPdf } from './generateAttributionPdf'

export const NO_COMPONENTS_FILTERED_MESSAGE =
  'No components match your current export options. Please adjust the options and try again.'

const AttributionTable = ({
  isOpen,
  onClose,
  data,
  loading,
  filters,
  setFilters,
  paginationProps,
  error,
  sbomData
}) => {
  const { showToast } = useCustomToast()
  const params = useParams()

  const { search, primary, internal } = filters || {}

  const [filterMode, setFilterMode] = useState('OR')
  const [searchText, setSearchText] = useState(search || '')
  const [downloadType, setDownloadType] = useState('pdf')
  const [selectedRowData, setSelectedRowData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sourcePreferences, setSourcePreferences] = useState({})
  const [editingRow, setEditingRow] = useState({
    id: null,
    field: null,
    name: '',
    copyright: '',
    license: ''
  })
  const [includeEmptyLicenses, setIncludeEmptyLicenses] = useState(true)
  const [includeUnresolvedLicenses, setIncludeUnresolvedLicenses] =
    useState(true)

  const {
    primaryBlueText,
    primaryErrorColor,
    primarySuccessColor,
    primaryTextColor,
    inverseSecondaryBgColor
  } = useThemeColor([
    'primaryBlueText',
    'primaryErrorColor',
    'primarySuccessColor',
    'primaryTextColor',
    'inverseSecondaryBgColor'
  ])

  const productName = sbomData?.project?.projectGroup?.name
  const productVersion = sbomData?.projectVersion

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

  const handleRowSelect = (state) => {
    setSelectedRowData(state?.selectedRows)
  }

  const handleSourceChange = (componentId, value) => {
    setSourcePreferences((prev) => ({
      ...prev,
      [componentId]: value
    }))
  }

  const getValueFromSource = (row, field) => {
    const source = sourcePreferences[row.components[0].id] || 'sbom'
    if (source === 'sbom') {
      return row.attribution[field]
    }

    const value = row.attributionOverride?.[field]
    return value
  }

  const handleEditClose = () => {
    setEditingRow({
      id: null,
      field: null,
      copyright: '',
      license: '',
      notice: '',
      enrichedContent: {}
    })
  }

  const handleBulkSourceChange = (source) => {
    if (source === '') return
    const newPreferences = { ...sourcePreferences }
    selectedRowData.forEach((row) => {
      newPreferences[row.components[0].id] = source
    })
    setSourcePreferences(newPreferences)
  }

  const onEdit = (row, field) => {
    handleEdit(row, field, row.name, row.copyright, row.licensesExp)
  }

  const handleEdit = (row, field) => {
    setEditingRow({
      id: row?.components[0]?.id,
      sbomId: row?.components[0]?.sbomId,
      field,
      name: row?.components[0]?.name,
      copyright: row.attribution.copyright,
      license: row.attribution.licensesExp,
      notice: row.attribution.notice,
      enrichedContent: row.attributionOverride,
      components: row.components[0]
    })
  }

  const handleIncludeParts = (e) => {
    const { checked } = e.target
    setFilters((prev) => ({
      ...prev,
      parts: checked
    }))
    // reset()
  }

  const handleDownload = async () => {
    setIsLoading(true)

    try {
      let finalItems = []

      if (selectedRowData.length > 0) {
        finalItems = [...selectedRowData].sort((a, b) =>
          a.components[0].name.localeCompare(b.components[0].name)
        )
      } else {
        // Fetch all components
        let allComponents = []
        let hasNext = true
        let cursor = null

        while (hasNext) {
          const res = await client.query({
            query: GetAttributionsData,
            variables: {
              ...filters,
              orderBy: {
                direction: 'ASC',
                field: 'COMPONENTS_NAME'
              },
              first: 200,
              after: cursor
            }
          })

          const nodes = res.data.attributions.nodes || []
          const pageInfo = res.data.attributions.pageInfo

          allComponents.push(...nodes)
          cursor = pageInfo.endCursor
          hasNext = pageInfo.hasNextPage
        }
        finalItems = allComponents
      }

      // Trigger download
      if (downloadType === 'pdf') {
        await generateAttributionPdf(
          finalItems,
          productName,
          productVersion,
          sourcePreferences,
          includeEmptyLicenses,
          includeUnresolvedLicenses
        )
      } else {
        await downloadAttributionHtml(
          finalItems,
          productName,
          productVersion,
          sourcePreferences,
          includeEmptyLicenses,
          includeUnresolvedLicenses
        )
      }
    } catch (error) {
      const isPdfEmptyFromFilters =
        error?.message === NO_COMPONENTS_FILTERED_MESSAGE

      showToast({
        description: isPdfEmptyFromFilters
          ? error.message
          : `Error downloading Attribution ${downloadType.toUpperCase()}. Please try again later.`,
        status: isPdfEmptyFromFilters ? '' : 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        id: 'COMPONENTS_NAME',
        name: 'NAME',
        selector: (row) => {
          const sbomId = row?.components[0].sbomId
          const isPart = sbomId !== params?.sbomid
          return (
            <Flex sx={{ alignItems: 'center', gap: 2, my: 4 }}>
              <Text
                fontSize={14}
                fontWeight={'medium'}
                color={primaryTextColor}
                aria-label='component_name'
              >
                {truncatedValue(row?.components[0]?.name, 30)}
              </Text>
              {isPart && (
                <Box>
                  <LynkBadge color='blue' title='Part' />
                </Box>
              )}
            </Flex>
          )
        },
        width: '20%',
        wrap: true,
        sortable: true
      },
      // VERSION
      {
        id: 'COMPONENTS_VERSION',
        name: 'VERSION',
        selector: (row) => (
          <Text my={4} fontSize={14} color={primaryTextColor}>
            {row?.components[0]?.version || 'N/A'}
          </Text>
        ),
        width: '10%',
        sortable: true
      },
      // LICENSES
      {
        id: 'COMPONENTS_LICENSES_EXP',
        name: 'LICENSES',
        selector: (row) => {
          const source = sourcePreferences[row.components[0].id] || 'sbom'

          const showExclamation =
            source === 'sbom' &&
            (row.attribution['licensesExp'] || '') !==
              (row.attributionOverride?.['licensesExp'] || '')

          return (
            <Flex alignItems='center' gap={2}>
              <IconButton
                icon={
                  source === 'library' ? (
                    <LuEye size={16} />
                  ) : (
                    <EditButton size={16} />
                  )
                }
                size='sm'
                variant='ghost'
                onClick={() => onEdit(row, 'license')}
              />
              {showExclamation && (
                <Tooltip
                  label='The license in the SBOM differs from the license declared by the package library.'
                  placement='top'
                >
                  <span style={{ cursor: 'pointer' }}>
                    <LuCircleAlert size={16} color={primaryBlueText} />
                  </span>
                </Tooltip>
              )}
              <Tooltip
                label={getValueFromSource(row, 'licensesExp')}
                placement={'top'}
              >
                <Text fontSize={14} color={primaryTextColor}>
                  {truncatedValue(
                    getValueFromSource(row, 'licensesExp') || 'N/A',
                    20
                  )}
                </Text>
              </Tooltip>
            </Flex>
          )
        },
        width: '20%',
        sortable: true
      },
      // NOTICE
      {
        id: 'notice',
        name: 'NOTICE',
        selector: (row) => (
          <Flex alignItems='center' gap={2}>
            <IconButton
              icon={
                sourcePreferences[row.components[0].id] === 'library' ? (
                  <LuEye size={16} />
                ) : (
                  <EditButton size={16} />
                )
              }
              size='sm'
              variant='ghost'
              onClick={() => onEdit(row, 'notice')}
            />
            {getValueFromSource(row, 'notice') ? (
              <LuCircleCheck fontSize={20} color={primarySuccessColor} />
            ) : (
              <LuCircleX fontSize={20} color={primaryErrorColor} />
            )}
          </Flex>
        ),
        width: '10%'
      },
      // COPYRIGHT
      {
        id: 'copyright',
        name: 'COPYRIGHT',
        selector: (row) => (
          <Flex alignItems='center' gap={2}>
            <IconButton
              icon={
                sourcePreferences[row.components[0].id] === 'library' ? (
                  <LuEye size={16} />
                ) : (
                  <EditButton size={16} />
                )
              }
              size='sm'
              variant='ghost'
              onClick={() => onEdit(row, 'copyright')}
            />
            {getValueFromSource(row, 'copyright') ? (
              <LuCircleCheck fontSize={20} color={primarySuccessColor} />
            ) : (
              <LuCircleX fontSize={20} color={primaryErrorColor} />
            )}
          </Flex>
        ),
        width: '10%'
      },
      // PATCHES
      {
        id: 'patches',
        name: 'PATCHES',
        selector: (row) => {
          const patches = row?.components?.[0]?.patches || []
          return (
            <Flex alignItems='center' gap={2}>
              <IconButton
                icon={<EditButton size={16} />}
                size='sm'
                variant='ghost'
                onClick={() => onEdit(row, 'patches')}
              />
              {patches.length === 0 ? (
                <LuCircleX fontSize={20} color={primaryErrorColor} />
              ) : (
                <LuCircleCheck fontSize={20} color={primarySuccessColor} />
              )}
            </Flex>
          )
        },
        width: '10%'
      },
      // SOURCE
      {
        id: 'source',
        name: 'SOURCE',
        selector: (row) => (
          <Select
            value={sourcePreferences[row.components[0].id]}
            onChange={(e) =>
              handleSourceChange(row.components[0].id, e.target.value)
            }
            isDisabled={false}
            isReadOnly={false}
            color={primaryTextColor}
          >
            <option value='sbom'>SBOM</option>
            <option value='library'>Library</option>
          </Select>
        ),
        width: '15%'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourcePreferences]
  )

  const checkIcon =
    filterMode === 'AND' ? (
      <LuCircleSlash size={18} color={inverseSecondaryBgColor} />
    ) : (
      <LuCheck size={18} color={inverseSecondaryBgColor} />
    )

  const Info = () => (
    <Text fontWeight={'normal'}>
      Use <Kbd>⇧</Kbd> + <Kbd>click </Kbd> to exclude
    </Text>
  )

  const handleMenuClick = (event, value) => {
    if (event.shiftKey) {
      setFilterMode('AND')
      setFilters((prev) => ({
        ...prev,
        primary:
          value === 'all' ? undefined : value === 'primary' ? false : undefined,
        internal:
          value === 'all' ? undefined : value === 'internal' ? false : undefined
      }))
    } else {
      setFilterMode('OR')
      setFilters((prev) => ({
        ...prev,
        primary:
          value === 'all' ? undefined : value === 'primary' ? true : undefined,
        internal:
          value === 'all' ? undefined : value === 'internal' ? true : undefined
      }))
    }
  }

  const subHeader = useMemo(
    () => (
      <Flex
        gap={2}
        width={'100%'}
        justifyContent={'space-between'}
        alignItems={'center'}
        paddingBottom={2}
      >
        <Flex gap={4} flexWrap={'wrap'}>
          <SearchFilter
            id='attribution'
            filterText={searchText}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Menu closeOnSelect={false}>
            <MenuHeading
              title={'Visibility'}
              active={primary || internal || filterMode === 'AND'}
            />
            <MenuList>
              <MenuOptionGroup type={'radio'}>
                {['all', 'primary', 'internal'].map((item, index) => (
                  <MenuItemOption
                    key={index}
                    value={item}
                    fontSize={'sm'}
                    icon={checkIcon}
                    wordBreak={'break-all'}
                    onClick={(e) => handleMenuClick(e, item)}
                    isDisabled={filterMode === 'AND' && item === 'all'}
                  >
                    {capitalizeFirstLetter(item)}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
              <MenuDivider />
              <MenuGroup title={<Info />}></MenuGroup>
            </MenuList>
          </Menu>

          <LicenseFilterMenu filters={filters} setFilters={setFilters} />
          <Checkbox
            name='includeParts'
            onChange={handleIncludeParts}
            isChecked={!!filters.parts}
          >
            <Text fontSize='sm' fontWeight='normal'>
              Include Parts
            </Text>
          </Checkbox>

          {selectedRowData.length > 0 && (
            <Select
              placeholder={`Change source for ${selectedRowData.length} selected ${selectedRowData.length === 1 ? 'item' : 'items'}`}
              width='300px'
              onChange={(e) => handleBulkSourceChange(e.target.value)}
            >
              <option value='sbom'>Set Source to SBOM</option>
              <option value='library'>Set Source to Library</option>
            </Select>
          )}
        </Flex>

        <Flex alignItems='center' gap={4}>
          <RadioGroup value={downloadType} onChange={setDownloadType}>
            <Stack direction='row' spacing={4}>
              <Radio value='pdf'>PDF</Radio>
              <Radio value='html'>HTML</Radio>
            </Stack>
          </RadioGroup>
          <Menu closeOnSelect={false}>
            <MenuButton as={Button} fontWeight='medium'>
              Export Options
            </MenuButton>
            <MenuList>
              <Box px={3} py={2} display='flex' flexDirection='column' gap={2}>
                <Checkbox
                  isChecked={includeEmptyLicenses}
                  onChange={(e) => setIncludeEmptyLicenses(e.target.checked)}
                >
                  Include Empty Licenses
                </Checkbox>
                <Checkbox
                  isChecked={includeUnresolvedLicenses}
                  onChange={(e) =>
                    setIncludeUnresolvedLicenses(e.target.checked)
                  }
                >
                  Include Unresolved Licenses
                </Checkbox>
              </Box>
            </MenuList>
          </Menu>

          <Button
            isLoading={isLoading}
            colorScheme='blue'
            onClick={handleDownload}
          >
            Export
          </Button>
        </Flex>
      </Flex>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      searchText,
      handleSearch,
      handleClear,
      downloadType,
      isLoading,
      selectedRowData,
      filters,
      handleBulkSourceChange,
      includeEmptyLicenses,
      includeUnresolvedLicenses
    ]
  )

  return (
    <>
      <LynkDrawer
        title='License Attribution Report'
        isOpen={isOpen}
        onClose={onClose}
        size='full'
        placement={'bottom'}
        noFooter
      >
        <Box p={4}>
          {error ? (
            <Text>Something went wrong</Text>
          ) : (
            <Flex width={'100%'} flexDir={'column'} alignItems={'flex-start'}>
              <LynkTable
                subHeader
                fixedHeader
                data={data}
                selectableRows
                columns={columns}
                onSort={handleSort}
                progressPending={loading}
                subHeaderComponent={subHeader}
                fixedHeaderScrollHeight='60vh'
                className='data-table-container'
                onSelectedRowsChange={handleRowSelect}
              />
            </Flex>
          )}
          <Pagination {...paginationProps} />
        </Box>
        <AttributionReportsEditModal
          isOpen={editingRow.id !== null}
          onClose={handleEditClose}
          rowData={editingRow}
          setSelectedRowData={setSelectedRowData}
          sourcePreferences={sourcePreferences}
        />
      </LynkDrawer>
    </>
  )
}

export default AttributionTable
