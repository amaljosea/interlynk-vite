import { useQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import useQueryParam from 'hooks/useQueryParam'

import { GetOrgRules } from 'graphQL/Queries'

const CheckFilters = ({ filters, setCheckState }) => {
  const activeTab = useQueryParam('tab')

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

  if (filters) {
    return (
      <Stack direction={'row'} alignItems={'center'} gap={1}>
        {/* CHECK ID */}
        {data && (
          <Box width={'fit-content'}>
            <Menu closeOnSelect={false}>
              <MenuHeading title={'Check ID'} active={rules.length !== 0} />
              <MenuList
                fontSize={'sm'}
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
        <Box width={'fit-content'}>
          <Menu closeOnSelect={false}>
            <MenuHeading title={'Category'} active={categories.length !== 0} />
            <CustomList
              options={checkCategories}
              value={categories}
              onChange={onFilterCategory}
            />
          </Menu>
        </Box>
        {/* SEVERITY */}
        <Box width={'fit-content'}>
          <Menu closeOnSelect={false}>
            <MenuHeading title={'Severity'} active={severities.length !== 0} />
            <CustomList
              options={['critical', 'high', 'medium', 'low']}
              value={severities}
              onChange={onFilterSeverity}
            />
          </Menu>
        </Box>
        {/* STATUS */}
        <Box width={'fit-content'}>
          <Menu closeOnSelect={false}>
            <MenuHeading title={'Resolution'} active={statues.length !== 0} />
            <CustomList
              options={checkStatuses}
              value={statues}
              onChange={onFilterStatus}
            />
          </Menu>
        </Box>
      </Stack>
    )
  }

  return null
}

export default CheckFilters
