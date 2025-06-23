import { client } from 'context/ApolloWrapper'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { truncatedValue } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Box,
  Button,
  Checkbox,
  Flex,
  IconButton,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text
} from '@chakra-ui/react'

import EditButton from 'components/Icons/EditButton'
import LynkBadge from 'components/LynkBadge'
import LynkDrawer from 'components/LynkDrawer'
import LynkTable from 'components/LynkTable'
import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetAttributionsData } from 'graphQL/Queries'

import { LuCircleCheck, LuCircleX, LuEye } from 'react-icons/lu'

import { downloadAttributionHtml } from './AttributionHtml'
import AttributionReportsEditModal from './AttributionReportsEditModal'
import { generateAttributionPdf } from './generateAttributionPdf'

const licenseTypes = {
  All: 'all',
  'SPDX Single': 'standard',
  'SPDX Expression': 'expression',
  Custom: 'custom',
  'No License': 'blank'
}

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

  const [searchText, setSearchText] = useState(filters.search || '')
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

  const { primaryErrorColor, primarySuccessColor, primaryTextColor } =
    useThemeColor([
      'primaryErrorColor',
      'primarySuccessColor',
      'primaryTextColor'
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
      enrichedContent: row.attributionOverride
    })
  }

  const handleVisibilityChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      visibility:
        value.toLowerCase() === 'all' ? undefined : value.toUpperCase()
    }))
    // reset()
  }

  const handlelicenseTypeChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      licenseType:
        value.toLowerCase() === 'all' ? undefined : value.toUpperCase()
    }))
    // reset()
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
          sourcePreferences
        )
      } else {
        downloadAttributionHtml(
          finalItems,
          productName,
          productVersion,
          sourcePreferences
        )
      }
    } catch (error) {
      showToast({
        description: `Error downloading Attribution ${downloadType.toUpperCase()}. Please try again later.`,
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }
  const generateMenuItems = (availableFilters) => {
    return Object.entries(availableFilters).map(([key, value]) => (
      <MenuItemOption key={key} value={value} fontSize={'sm'}>
        {key}
      </MenuItemOption>
    ))
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
        width: '25%',
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
              onClick={() => onEdit(row, 'license')}
            />
            <Text fontSize={14} color={primaryTextColor}>
              {truncatedValue(
                getValueFromSource(row, 'licensesExp') || 'N/A',
                30
              )}
            </Text>
          </Flex>
        ),
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
        width: '20%'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourcePreferences]
  )

  const subHeader = useMemo(
    () => (
      <Flex gap={2} width={'100%'} justifyContent={'space-between'}>
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
              active={filters.visibility && filters.visibility !== 'ALL'}
            />
            <CustomList
              type='radio'
              options={['internal', 'primary', 'direct']}
              value={filters.visibility?.toLowerCase() || 'all'}
              onChange={handleVisibilityChange}
            />
          </Menu>

          <Menu closeOnSelect={true}>
            <MenuHeading title='License Type' active={!!filters.licenseType} />
            <MenuList>
              <MenuOptionGroup
                type='radio'
                value={filters.licenseType?.toLowerCase() || 'all'}
                onChange={handlelicenseTypeChange}
              >
                {generateMenuItems(licenseTypes)}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
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
              placeholder={`Change source for selected items`}
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
      handleBulkSourceChange
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
      </LynkDrawer>

      <AttributionReportsEditModal
        isOpen={editingRow.id !== null}
        onClose={handleEditClose}
        rowData={editingRow}
        setSelectedRowData={setSelectedRowData}
        sourcePreferences={sourcePreferences}
      />
    </>
  )
}

export default AttributionTable
