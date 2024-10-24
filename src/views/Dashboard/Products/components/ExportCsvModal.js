import { client } from 'context/ApolloWrapper'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { convertToCSV, downloadCSV, generateCsvFileName } from 'utils'
import { exportCsvTableConfig } from 'variables/general'

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Wrap
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import useExportCsvQueryInfo from 'hooks/useExportCsvQueryInfo'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaFileCsv } from 'react-icons/fa6'

const ExportCsvModal = ({ isOpen, onClose, tableType, filters }) => {
  const { showToast } = useCustomToast()
  const params = useParams()

  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid

  const {
    primaryTextColor,
    secondaryBgColor,
    sameSecondaryText,
    customLightBlue,
    customDarkBlue
  } = useThemeColor([
    'primaryTextColor',
    'secondaryBgColor',
    'sameSecondaryText',
    'lightBlueBg',
    'customLightBlue',
    'customDarkBlue'
  ])

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
      setAvailableColumns(config.additionalColumns)
    }
  }, [tableType])

  const mapDataForExport = (fetchedNodes) => {
    const config = exportCsvTableConfig[tableType]
    return config ? config.mapDataForExport(fetchedNodes) : []
  }

  const fileName = generateCsvFileName({
    tableType,
    rowsToExport,
    applyFilters,
    product: sbomHookData.projectGroupName,
    version: sbomHookData.versionName,
    vulnId,
    projectGroupName
  })

  const handleExport = async () => {
    setIsLoading(true)
    try {
      let allFetchedData = []
      let hasNextPage = true
      let endCursor = null

      const fetchNodes = (res, selector) =>
        selector.split('.').reduce((acc, key) => acc?.[key], res.data)

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
          downloadCSV(csvContent, fileName)
        }
      }
    } catch (error) {
      console.error('Export Error:', error)
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
    <>
      {isOpen && (
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
            <Box>
              <Text fontSize='14px' fontWeight='500' mb={2}>
                Rows To Export
              </Text>
              <RadioGroup onChange={setRowsToExport} value={rowsToExport}>
                <Stack direction='row' spacing={8}>
                  <Radio value='200' colorScheme='blue'>
                    All
                  </Radio>
                  <Radio value='25' colorScheme='blue'>
                    25
                  </Radio>
                  <Radio value='50' colorScheme='blue'>
                    50
                  </Radio>
                  <Radio value='100' colorScheme='blue'>
                    100
                  </Radio>
                </Stack>
              </RadioGroup>
            </Box>
            <Divider />
            <Box>
              <Text fontSize='14px' fontWeight='500' mb={2}>
                Columns To Export
              </Text>
              <Wrap
                mb={4}
                border='1px solid #DDE3EC'
                borderRadius='4px'
                padding='10px'
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
                    borderRadius='4px'
                    variant='solid'
                    bg={customLightBlue}
                  >
                    <TagLabel color={customDarkBlue}>{column}</TagLabel>
                    <TagCloseButton
                      color={customDarkBlue}
                      fontWeight='500'
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
      )}
    </>
  )
}

export default ExportCsvModal
