import {
  Box,
  Button,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import { GetOrgRules } from 'graphQL/Queries'
import { useQuery } from '@apollo/client'
import { useGlobalState } from 'hooks/useGlobalState'
import MenuHeading from 'components/Misc/MenuHeading'

const CheckFilterMenu = ({ refetch, productId, sbomId }) => {
  const { totalRows, prodCheckState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    searchInput,
    rules,
    categories,
    severities,
    statues,
    filters
  } = prodCheckState
  const { prodCheckDispatch } = dispatch

  const { checkCategories, checkStatuses } = filters

  const onFilter = (checkId, category, severity, status) => {
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        search: searchInput !== '' ? searchInput : undefined,
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
        field: field,
        direction: direction
      }
    })
  }

  const onFilterCheckId = (value) => {
    onFilter(value, categories, severities, statues)
    prodCheckDispatch({
      type: 'FILTER_RULE',
      payload: value
    })
  }

  const onFilterCategory = (value) => {
    onFilter(rules, value, severities, statues)
    prodCheckDispatch({
      type: 'FILTER_CATEGORY',
      payload: value
    })
  }

  const onFilterSeverity = (value) => {
    onFilter(rules, categories, value, statues)
    prodCheckDispatch({
      type: 'FILTER_SEVERITY',
      payload: value
    })
  }

  const onFilterStatus = (value) => {
    onFilter(rules, categories, severities, value)
    prodCheckDispatch({
      type: 'FILTER_STATUS',
      payload: value
    })
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
          <Menu closeOnSelect={false}>
            {rules.length !== 0 && <CheckMark />}
            <MenuHeading title={'Check ID'} />
            <MenuList
              minHeight={'auto'}
              maxHeight={'300px'}
              overflow={'hidden'}
              overflowY={'scroll'}
            >
              <MenuOptionGroup
                type='checkbox'
                value={rules}
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
                    >
                      {item.rule.friendlyId}: {item.rule.shortDesc}
                    </MenuItemOption>
                  ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        </Box>
      )}
      {/* CATEGORY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {categories.length !== 0 && <CheckMark />}
          <MenuHeading title={'Category'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={categories}
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
        <Menu closeOnSelect={false}>
          {severities.length !== 0 && <CheckMark />}
          <MenuHeading title={'Severity'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={severities}
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
        <Menu closeOnSelect={false}>
          {statues.length !== 0 && <CheckMark />}
          <MenuHeading title={'Status'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={statues}
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
