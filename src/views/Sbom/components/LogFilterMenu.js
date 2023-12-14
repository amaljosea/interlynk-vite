import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import GlobalContext from 'context/GlobalContext'
import { useState, useContext } from 'react'
import { FaFilter } from 'react-icons/fa'

const LogFilterMenu = ({
  refetch,
  productId,
  sbomId,
  setPageIndex,
  totalRows
}) => {
  const { logFilters, logField, logDirection } = useContext(GlobalContext)
  const { logChangeBys, logChangeObjects, logChangeTypes } = logFilters

  const [selectChangeBy, setSelectChangeBy] = useState([])
  const [selectChangeObj, setSelectChangeObj] = useState([])
  const [selectChangeType, setSelectChangeType] = useState([])

  const onFilterChangeBy = (value) => {
    setSelectChangeBy(value.includes('all') ? [] : value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      changedBy: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: logField,
      direction: logDirection
    })
    setPageIndex(1)
  }

  const onFilterChangeObj = (value) => {
    setSelectChangeObj(value.includes('all') ? [] : value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      changeObject: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: logField,
      direction: logDirection
    })
    setPageIndex(1)
  }

  const onFilterChangeType = (value) => {
    setSelectChangeType(value.includes('all') ? [] : value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      changeType: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: logField,
      direction: logDirection
    })
    setPageIndex(1)
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* USER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {selectChangeBy.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            User
          </MenuButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
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
          {selectChangeObj.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Object
          </MenuButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={selectChangeObj}
              onChange={onFilterChangeObj}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeObjects?.map((item, index) => (
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
      {/* TYPE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectChangeType.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Type
          </MenuButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={selectChangeType}
              onChange={onFilterChangeType}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeTypes?.map((item, index) => (
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
    </Stack>
  )
}

export default LogFilterMenu
