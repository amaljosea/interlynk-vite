import { useEffect, useState } from 'react'
import { convertToCSV, downloadCSV } from 'utils'
import { exportCsvTableConfig } from 'variables/general'

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Tooltip,
  Wrap,
  useDisclosure
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaFileCsv } from 'react-icons/fa6'

const ExportCsv = ({ tableData, tableType }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { primaryTextColor, secondaryBgColor } = useThemeColor([
    'primaryTextColor',
    'secondaryBgColor'
  ])

  const [rowsToExport, setRowsToExport] = useState('All')
  const [selectedColumns, setSelectedColumns] = useState([])
  const [availableColumns, setAvailableColumns] = useState([])
  const [applyFilters, setApplyFilters] = useState(true)

  useEffect(() => {
    const config = exportCsvTableConfig[tableType]
    if (config) {
      setSelectedColumns(config.defaultSelectedColumns)
      setAvailableColumns(config.additionalColumns)
    }
  }, [tableType])

  const mapDataForExport = () => {
    const config = exportCsvTableConfig[tableType]
    return config ? config.mapDataForExport(tableData) : []
  }

  const handleExport = () => {
    const dataToExport = mapDataForExport()
    const csvContent = convertToCSV(dataToExport, selectedColumns)
    downloadCSV(csvContent, `${tableType}-export.csv`)
    onClose()
  }

  const removeColumn = (column) => {
    setSelectedColumns(selectedColumns.filter((item) => item !== column))
    setAvailableColumns([...availableColumns, column])
  }

  const addColumn = (column) => {
    setAvailableColumns(availableColumns.filter((item) => item !== column))
    setSelectedColumns([...selectedColumns, column])
  }

  return (
    <>
      <Tooltip label='Export CSV'>
        <IconButton
          onClick={onOpen}
          icon={<FaFileCsv fontSize={18} />}
          colorScheme='blue'
          variant='solid'
          name='export_csv'
          fontSize='sm'
          fontWeight='normal'
        />
      </Tooltip>

      {isOpen && (
        <LynkModal
          isOpen={isOpen}
          onClose={onClose}
          buttonText='Download'
          onSubmit={handleExport}
          title='Export CSV'
          Icon={FaFileCsv}
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
                  <Radio value='All' colorScheme='blue'>
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
                  <Text color='gray.500' fontSize='sm'>
                    No columns selected
                  </Text>
                )}
                {selectedColumns.map((column, index) => (
                  <Tag
                    size='sm'
                    key={index}
                    borderRadius='4px'
                    variant='solid'
                    bg='#BEE3F8'
                  >
                    <TagLabel color='#2A4365'>{column}</TagLabel>
                    <TagCloseButton
                      color='#2A4365'
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

export default ExportCsv
