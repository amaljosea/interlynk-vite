import { CheckIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { useContext, useState } from 'react'
import { FaFilter } from 'react-icons/fa'

const CheckMark = () => {
  return (
    <CheckIcon
      w={5}
      h={5}
      bg={'white'}
      color={'blue.500'}
      border={'1px solid #4299E1'}
      rounded={'full'}
      p={'4px'}
      position={'absolute'}
      right={-1}
      top={-1}
      zIndex={11}
    />
  )
}

const VulnFilterMenu = ({
  refetch,
  productId,
  sbomId,
  setPageIndex,
  totalRows
}) => {
  const { vulnFilters, vulnField, vulnDirection } = useContext(GlobalContext)

  const { vulnCompNames, vulnStatuses } = vulnFilters

  const [selectCompName, setSelectCompName] = useState([])
  const [selectSeverity, setSelectSeverity] = useState([])
  const [selectedStatus, setSelectedStatus] = useState([])
  const [selectedKev, setSelectedKev] = useState('')
  const [selectedEpss, setSelectedEpss] = useState('')
  const [minVal, setMinVal] = useState()
  const [maxVal, setMaxVal] = useState()

  const onFilterCompName = (value) => {
    setSelectCompName(value.includes('all') ? [] : value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      componentName: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: vulnField,
      direction: vulnDirection
    })
    setPageIndex(1)
  }

  const onFilterSeverity = (value) => {
    setSelectSeverity(value.includes('all') ? [] : value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      severity: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: vulnField,
      direction: vulnDirection
    })
    setPageIndex(1)
  }

  const onFilterStatus = (value) => {
    setSelectedStatus(value.includes('all') ? [] : value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      status: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: vulnField,
      direction: vulnDirection
    })
    setPageIndex(1)
  }

  const onFilterKev = (value) => {
    setSelectedKev(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      kev: value === 'all' ? undefined : value === 'yes' ? true : false,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: vulnField,
      direction: vulnDirection
    })
    setPageIndex(1)
  }

  const onFilterEpss = (value) => {
    setMinVal(0)
    setMaxVal(0)
    setSelectedEpss(value)

    const epss = value !== 'all' && value.split('-')

    const range = {
      min: parseFloat(epss[0]),
      max: parseFloat(epss[1])
    }

    refetch({
      projectId: productId,
      sbomId: sbomId,
      epss: value === 'all' ? undefined : range,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: vulnField,
      direction: vulnDirection
    })
    setPageIndex(1)
  }

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleSubmit = () => {
    const range = {
      min: parseFloat(minVal),
      max: parseFloat(maxVal)
    }
    refetch({
      projectId: productId,
      sbomId: sbomId,
      epss: range,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: vulnField,
      direction: vulnDirection
    })
    setPageIndex(1)
    onClose()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {selectSeverity.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Severity
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={selectSeverity}
              onChange={onFilterSeverity}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {['critical', 'high', 'medium', 'low'].map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* COMPONENT NAME */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectCompName.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Component
          </MenuButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={selectCompName}
              onChange={onFilterCompName}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {vulnCompNames?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* STATUS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedStatus.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Status
          </MenuButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={selectedStatus}
              onChange={onFilterStatus}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {vulnStatuses?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* KEV */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedKev !== 'all' && selectedKev !== '' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            KEV
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={selectedKev}
              onChange={onFilterKev}
            >
              {['all', 'yes', 'no'].map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* EPSS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true} isOpen={isOpen} onClose={onClose}>
          {selectedEpss !== 'all' && selectedEpss !== '' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
            onClick={onOpen}
          >
            EPSS
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={selectedEpss}
              onChange={onFilterEpss}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {['0.1-0.25', '0.25-0.5', '0.5-1.0'].map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
            <MenuDivider />
            <Flex flexDirection={'column'} alignItems={'flex-start'}>
              <Stack direction={'row'} alignItems={'center'} pl={8}>
                <Input
                  type='number'
                  width={'60px'}
                  size='sm'
                  placeholder={'min'}
                  value={minVal}
                  onChange={(e) => setMinVal(e.target.value)}
                />
                <Box>-</Box>
                <Input
                  type='number'
                  width={'60px'}
                  size='sm'
                  placeholder={'max'}
                  value={maxVal}
                  onChange={(e) => setMaxVal(e.target.value)}
                />
              </Stack>
              <Button ml={8} my={2} size='sm' onClick={handleSubmit}>
                Submit
              </Button>
            </Flex>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default VulnFilterMenu
