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
import { useState, useContext } from 'react'
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

const LogFilterMenu = ({
  refetch,
  productId,
  sbomId,
  setPageIndex,
  totalRows
}) => {
  const { logFilters } = useContext(GlobalContext)
  const { logChangeBys, logChangeObjects, logChangeTypes } = logFilters

  const [selectChangeBy, setSelectChangeBy] = useState('')
  const [selectChangeObj, setSelectChangeObj] = useState('')
  const [selectChangeType, setSelectChangeType] = useState('')

  const onFilterChangeBy = (value) => {
    setSelectChangeBy(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      changedBy: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: 'CREATED_AT',
      direction: 'DESC'
    })
    setPageIndex(1)
  }

  const onFilterChangeObj = (value) => {
    setSelectChangeObj(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      changeObject: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: 'CREATED_AT',
      direction: 'DESC'
    })
    setPageIndex(1)
  }

  const onFilterChangeType = (value) => {
    setSelectChangeType(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      changeType: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: 'CREATED_AT',
      direction: 'DESC'
    })
    setPageIndex(1)
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* USER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {selectChangeBy !== '' && selectChangeBy !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            User
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={selectChangeBy}
              onChange={onFilterChangeBy}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeBys?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* OBJECT */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectChangeObj !== '' && selectChangeObj !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Object
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={selectChangeObj}
              onChange={onFilterChangeObj}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeObjects?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* TYPE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectChangeType !== '' && selectChangeType !== 'all' && (
            <CheckMark />
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Type
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={selectChangeType}
              onChange={onFilterChangeType}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeTypes?.map((item, index) => (
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

export default LogFilterMenu
