import { useQuery } from '@apollo/client'
import { client } from 'context/ApolloWrapper'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { convertToCSV, downloadCSV, generateCsvFileName } from 'utils'
import { fetchNodes } from 'utils'
import { exportCsvTableConfig } from 'variables/general'

import { Box, Button, Divider, Flex, Stack, Text, Wrap } from '@chakra-ui/react'
import { Checkbox, Radio, RadioGroup } from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import useExportCsvQueryInfo from 'hooks/useExportCsvQueryInfo'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useProjectGroup } from 'hooks/useProjectGroup'
import useQueryParam from 'hooks/useQueryParam'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetCustomFields } from 'graphQL/Queries'

import { FaFileCsv } from 'react-icons/fa6'

const ExportCsvModal = ({ isOpen, onClose, tableType, filters }) => {
  const params = useParams()
  const { showToast } = useCustomToast()
  const { organization } = useGlobalState()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const vulnId = useQueryParam('vulnId') || params.vulnerabilityid

  const {
    primaryTextColor,
    secondaryBgColor,
    sameSecondaryText,
    customLightBlue,
    customDarkBlue,
    grayBorderColor
  } = useThemeColor([
    'primaryTextColor',
    'secondaryBgColor',
    'sameSecondaryText',
    'lightBlueBg',
    'customLightBlue',
    'customDarkBlue',
    'grayBorderColor'
  ])

  const { data: customFieldsData } = useQuery(GetCustomFields, {
    skip: tableType !== 'SBOM Vulnerability View'
  })
  const customFieldNodes =
    customFieldsData?.componentVulnCustomFieldDefinitions?.nodes

  const [rowsToExport, setRowsToExport] = useState('200')
  const [selectedColumns, setSelectedColumns] = useState([])
  const [availableColumns, setAvailableColumns] = useState([])
  const [applyFilters, setApplyFilters] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const searchFilters = applyFilters ? filters : {}

  const queryInfo = useExportCsvQueryInfo(
    tableType,
    rowsToExport,
    searchFilters
  )

  const { sbomHookData } = useGlobalQueryContext()
  const { name: projectGroupName } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

  useEffect(() => {
    const config = exportCsvTableConfig[tableType]

    if (config) {
      setSelectedColumns(config.defaultSelectedColumns)
      if (
        customFieldNodes?.length > 0 &&
        tableType === 'SBOM Vulnerability View'
      ) {
        const customFields =
          customFieldNodes?.map((node) => node?.displayName) || []

        setAvailableColumns([...config.additionalColumns, ...customFields])
      } else {
        setAvailableColumns(config.additionalColumns)
      }
    }
  }, [tableType, customFieldNodes])

  const mapDataForExport = (fetchedNodes) => {
    const config = exportCsvTableConfig[tableType]
    return config ? config.mapDataForExport(fetchedNodes) : []
  }

  const orgName = organization?.name?.replaceAll(' ', '-') || 'test-interlynk'

  const fileName = generateCsvFileName({
    tableType,
    rowsToExport,
    applyFilters,
    product: sbomHookData.projectGroupName,
    version: sbomHookData.versionName,
    vulnId,
    projectGroupName,
    orgName
  })

  const handleExport = async () => {
    setIsLoading(true)
    try {
      let allFetchedData = []
      let hasNextPage = true
      let endCursor = null

      if (rowsToExport === '200') {
        while (hasNextPage) {
          const res = await client.query({
            query: queryInfo.query,
            variables: {
              ...queryInfo.variables,
              after: endCursor || undefined
            },
            fetchPolicy: 'no-cache'
          })

          if (res.data) {
            const fetchedNodes = fetchNodes(res, queryInfo.selector)
            const pageInfo = fetchNodes(res, queryInfo.pageInfoSelector)

            allFetchedData.push(...mapDataForExport(fetchedNodes))

            endCursor = pageInfo.endCursor
            hasNextPage = pageInfo.hasNextPage
          } else {
            hasNextPage = false
          }
        }

        if (allFetchedData.length > 0) {
          const csvContent = convertToCSV(allFetchedData, selectedColumns)
          downloadCSV(csvContent, fileName)
        } else {
          showToast({
            description: 'No data available for export.',
            status: 'warning'
          })
        }
      } else {
        const res = await client.query({
          query: queryInfo.query,
          variables: queryInfo.variables,
          fetchPolicy: 'no-cache'
        })

        if (res.data) {
          const fetchedNodes = fetchNodes(res, queryInfo.selector)
          const dataToExport = mapDataForExport(fetchedNodes)
          const csvContent = convertToCSV(dataToExport, selectedColumns)
          if (dataToExport.length === 0) {
            showToast({
              description: 'No data available for export.',
              status: 'warning'
            })
          } else {
            downloadCSV(csvContent, fileName)
          }
        }
      }
    } catch (error) {
      console.warn('Export Error:', error)
      showToast({
        description:
          'Internal error during data download. Please try again in a few minutes.',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  const removeColumn = (column) => {
    setSelectedColumns(selectedColumns.filter((item) => item !== column))
    setAvailableColumns((prev) => [...prev, column])
  }

  const addColumn = (column) => {
    setAvailableColumns(availableColumns.filter((item) => item !== column))
    setSelectedColumns((prev) => [...prev, column])
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      buttonText='Download'
      onSubmit={handleExport}
      title='Export CSV'
      Icon={FaFileCsv}
      isLoading={isLoading}
    >
      <Flex direction='column' gap={4}>
        {tableType && (
          <Box>
            <Tag colorScheme='cyan'>{tableType}</Tag>
          </Box>
        )}
        {filters && (
          <Checkbox
            mt={1}
            size='md'
            colorScheme='blue'
            isChecked={applyFilters}
            onChange={() => setApplyFilters(!applyFilters)}
          >
            <Text fontSize='14px' fontWeight='500' color={primaryTextColor}>
              Apply search and filters
            </Text>
          </Checkbox>
        )}
        {tableType === 'SBOM Support View' && shouldShowDemoFeatures && (
          <Checkbox mt={1} size='md' colorScheme='blue'>
            <Text fontSize='14px' fontWeight='500' color={primaryTextColor}>
              Include Actively Supported Components
            </Text>
          </Checkbox>
        )}
        <Box>
          <Text fontSize='14px' fontWeight='500' mb={2}>
            Rows To Export
          </Text>
          <RadioGroup onChange={setRowsToExport} value={rowsToExport}>
            <Stack direction='row' spacing={8}>
              {['200', '25', '50', '100'].map((item, index) => (
                <Radio key={index} value={item} colorScheme='blue'>
                  {item === '200' ? 'All' : item}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </Box>
        <Divider />
        <Box>
          <Text fontSize='14px' fontWeight='500' mb={2}>
            Columns To Export
          </Text>
          <Wrap
            border={`1px solid ${grayBorderColor}`}
            sx={{ mb: 4, p: '10px', borderRadius: '10px' }}
          >
            {selectedColumns.length === 0 && (
              <Text color={sameSecondaryText} fontSize='sm'>
                No columns selected
              </Text>
            )}
            {selectedColumns.map((column, index) => (
              <Tag
                size='sm'
                key={index}
                variant='solid'
                sx={{ borderRadius: '4px', bg: customLightBlue }}
              >
                <TagLabel color={customDarkBlue}>{column}</TagLabel>
                <TagCloseButton
                  sx={{ fontWeight: '500', color: customDarkBlue }}
                  onClick={() => removeColumn(column)}
                />
              </Tag>
            ))}
          </Wrap>
          <Wrap spacing={3}>
            {availableColumns.map((column, index) => (
              <Button
                key={index}
                size='xs'
                title={column}
                colorScheme='gray'
                onClick={() => addColumn(column)}
                bg={secondaryBgColor}
              >
                + {column}
              </Button>
            ))}
          </Wrap>
        </Box>
      </Flex>
    </LynkModal>
  )
}

export default ExportCsvModal
