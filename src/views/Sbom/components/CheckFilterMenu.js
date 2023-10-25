import { CheckIcon } from '@chakra-ui/icons'
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

const CheckFilterMenu = ({
  refetch,
  productId,
  sbomId,
  setPageIndex,
  totalRows
}) => {
  const { compFilters } = useContext(GlobalContext)

  const { checkCategories, checkSeverities, checkStatuses } = compFilters

  const [selectCategory, setSelectCategory] = useState('')
  const [selectSeverity, setSelectSeverity] = useState('')
  const [selectStatus, setSelectStatus] = useState('')
  // const [selectCompName, setSelectCompName] = useState('')

  const onFilterCategory = (value) => {
    setSelectCategory(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      category: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: 'UPDATED_AT',
      direction: 'DESC'
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
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
    setPageIndex(1)
  }

  const onFilterStatus = (value) => {
    setSelectStatus(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      status: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
    setPageIndex(1)
  }

  // const onFilterCompName = (value) => {
  //   setSelectCompName(value)
  //   refetch({
  //     projectId: productId,
  //     sbomId: sbomId,
  //     componentName: value === 'all' ? undefined : value,
  //     first: totalRows,
  //     last: undefined,
  //     after: undefined,
  //     last: undefined,
  //     field: 'UPDATED_AT',
  //     direction: 'DESC'
  //   })
  //   setPageIndex(1)
  // }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* CATEGORY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {selectCategory !== '' && selectCategory !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Category
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={selectCategory}
              onChange={onFilterCategory}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {checkCategories?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* COMPONENT NAME */}
      {/* <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
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
          <MenuList height={'300px'} overflow={'hidden'} overflowY={'scroll'}>
            <MenuOptionGroup
              type='radio'
              value={selectCompName}
              onChange={onFilterCompName}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {checkCompNames &&
                checkCompNames.map((item, index) => (
                  <MenuItemOption key={index} value={item} fontSize={'sm'}>
                    {item}
                  </MenuItemOption>
                ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box> */}
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
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
              {checkSeverities?.map((item, index) => (
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
          {selectStatus !== '' && selectStatus !== 'all' && <CheckMark />}
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
              value={selectStatus}
              onChange={onFilterStatus}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {checkStatuses?.map((item, index) => (
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

export default CheckFilterMenu
