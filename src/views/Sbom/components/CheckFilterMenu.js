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
import { GetOrgRules } from 'graphQL/Queries'
import GlobalContext from 'context/GlobalContext'
import { useContext, useState } from 'react'
import { useQuery } from '@apollo/client'
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
  const {
    checkFilters,
    checkField,
    checkDirection,
    checkCategory,
    setCheckCategory,
    checkSeverity,
    setCheckSeverity,
    checkStatus,
    setCheckStatus,
    setCheckAfter,
    setCheckBefore
  } = useContext(GlobalContext)

  const { checkCategories, checkStatuses } = checkFilters

  const [checkIds, setCheckIds] = useState([])

  const onFilterCheckId = (value) => {
    setCheckIds(value.includes('all') ? [] : value)
  }

  const onFilterCategory = (value) => {
    setCheckAfter('')
    setCheckBefore('')
    setCheckCategory(value.includes('all') ? [] : value)
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        category: value.includes('all') ? undefined : value,
        first: totalRows,
        last: undefined,
        after: undefined,
        last: undefined,
        field: checkField,
        direction: checkDirection
      }
    })
    setPageIndex(1)
  }

  const onFilterSeverity = (value) => {
    setCheckAfter('')
    setCheckBefore('')
    setCheckSeverity(value.includes('all') ? [] : value)
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        severity: value.includes('all') ? undefined : value,
        first: totalRows,
        last: undefined,
        after: undefined,
        last: undefined,
        field: checkField,
        direction: checkDirection
      }
    })
    setPageIndex(1)
  }

  const onFilterStatus = (value) => {
    setCheckAfter('')
    setCheckBefore('')
    setCheckStatus(value.includes('all') ? [] : value)
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        status: value.includes('all') ? undefined : value,
        first: totalRows,
        last: undefined,
        after: undefined,
        last: undefined,
        field: checkField,
        direction: checkDirection
      }
    })
    setPageIndex(1)
  }

  const { data } = useQuery(GetOrgRules, {
    variables: {
      field: 'RULES_FRIENDLY_ID',
      direction: 'ASC'
    }
  })

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* CHECK ID */}
      {data && (
        <Box width={'fit-content'} position={'relative'}>
          <Menu closeOnBlur={true}>
            {checkIds.length !== 0 && <CheckMark />}
            <MenuButton
              as={Button}
              colorScheme='blue'
              fontWeight='normal'
              fontSize={'sm'}
              leftIcon={<FaFilter size={14} />}
            >
              Check ID
            </MenuButton>
            <MenuList
              minHeight={'auto'}
              maxHeight={'300px'}
              overflow={'hidden'}
              overflowY={'scroll'}
            >
              <MenuOptionGroup
                type='checkbox'
                value={checkIds}
                onChange={onFilterCheckId}
              >
                <MenuItemOption value={'all'} fontSize={'sm'}>
                  All
                </MenuItemOption>
                {data?.organization?.organizationRules?.map((item, index) => (
                  <MenuItemOption
                    key={index}
                    value={item.rule.friendlyId}
                    fontSize={'sm'}
                    textTransform={'capitalize'}
                  >
                    {item.rule.friendlyId}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        </Box>
      )}
      {/* CATEGORY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {checkCategory.length !== 0 && <CheckMark />}
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
              type='checkbox'
              value={checkCategory}
              onChange={onFilterCategory}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {checkCategories?.map((item, index) => (
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
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {checkSeverity.length !== 0 && <CheckMark />}
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
              value={checkSeverity}
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
      {/* STATUS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {checkStatus.length !== 0 && <CheckMark />}
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
              type='checkbox'
              value={checkStatus}
              onChange={onFilterStatus}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {checkStatuses?.map((item, index) => (
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

export default CheckFilterMenu
