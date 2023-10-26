import { CheckIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
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

  const [selectCompName, setSelectCompName] = useState('')
  const [selectSeverity, setSelectSeverity] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const onFilterCompName = (value) => {
    setSelectCompName(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      componentName: value === 'all' ? undefined : value,
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
    setSelectSeverity(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      severity: value === 'all' ? undefined : value,
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
    setSelectedStatus(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      status: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: vulnField,
      direction: vulnDirection
    })
    setPageIndex(1)
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {selectSeverity !== '' && selectSeverity !== 'all' && <CheckMark />}
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
              type='radio'
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
          {selectCompName !== '' && selectCompName !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Component
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
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
          {selectedStatus !== '' && selectedStatus !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Status
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={selectedStatus}
              onChange={onFilterStatus}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {vulnStatuses?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default VulnFilterMenu
