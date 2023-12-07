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
    checkSearchInput,
    checkRules,
    setCheckRules,
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

  const onFilter = (checkId, category, severity, status) => {
    setCheckAfter('')
    setCheckBefore('')
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        search: checkSearchInput !== '' ? checkSearchInput : undefined,
        checkId:
          checkId.includes('all') || checkId.length === 0 ? undefined : checkId,
        category:
          category.includes('all') || category.length === 0
            ? undefined
            : category,
        severity:
          severity.includes('all') || severity.length === 0
            ? undefined
            : severity,
        status:
          status.includes('all') || status.length === 0 ? undefined : status,
        first: totalRows,
        field: checkField,
        direction: checkDirection
      }
    })
    setPageIndex(1)
  }

  const onFilterCheckId = (value) => {
    setCheckRules(value.includes('all') ? [] : value)
    onFilter(value, checkCategory, checkSeverity, checkStatus)
  }

  const onFilterCategory = (value) => {
    setCheckCategory(value.includes('all') ? [] : value)
    onFilter(checkRules, value, checkSeverity, checkStatus)
  }

  const onFilterSeverity = (value) => {
    setCheckSeverity(value.includes('all') ? [] : value)
    onFilter(checkRules, checkCategory, value, checkStatus)
  }

  const onFilterStatus = (value) => {
    setCheckStatus(value.includes('all') ? [] : value)
    onFilter(checkRules, checkCategory, checkSeverity, value)
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
            {checkRules.length !== 0 && <CheckMark />}
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
                value={checkRules}
                onChange={onFilterCheckId}
              >
                <MenuItemOption value={'all'} fontSize={'sm'}>
                  All
                </MenuItemOption>
                {[...data.organization.organizationRules]
                  .sort((a, b) => {
                    const extractNumber = (str) => str.match(/\d+/) || [-1]
                    const numberA = parseInt(
                      extractNumber(a.rule.friendlyId)[0],
                      10
                    )
                    const numberB = parseInt(
                      extractNumber(b.rule.friendlyId)[0],
                      10
                    )
                    return numberA - numberB
                  })
                  .map((item, index) => (
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
