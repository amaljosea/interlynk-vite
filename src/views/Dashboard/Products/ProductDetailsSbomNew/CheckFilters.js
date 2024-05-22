import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import MenuHeading from 'components/Misc/MenuHeading'

import { GetOrgRules } from 'graphQL/Queries'

const CheckFilters = ({ filters, setCheckState }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const { data } = useQuery(GetOrgRules, {
    skip: activeTab === 'checks' ? false : true,
    variables: {
      field: 'RULES_FRIENDLY_ID',
      direction: 'ASC'
    }
  })

  const { checkCategories, checkStatuses } = filters || ''

  const [rules, setRules] = useState([])
  const onFilterCheckId = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setRules(value?.includes('all') ? [] : value)
    setCheckState((oldFilters) => ({
      ...oldFilters,
      checkId: filterValue
    }))
  }

  const [categories, setCategories] = useState([])
  const onFilterCategory = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setCategories(value?.includes('all') ? [] : value)
    setCheckState((oldFilters) => ({
      ...oldFilters,
      category: filterValue
    }))
  }

  const [severities, setSeverities] = useState([])
  const onFilterSeverity = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setSeverities(value?.includes('all') ? [] : value)
    setCheckState((oldFilters) => ({
      ...oldFilters,
      severity: filterValue
    }))
  }

  const [statues, setStatues] = useState([])
  const onFilterStatus = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setStatues(value?.includes('all') ? [] : value)
    setCheckState((oldFilters) => ({
      ...oldFilters,
      status: filterValue
    }))
  }

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
          <MenuHeading title={'Resolution'} />
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

export default CheckFilters
