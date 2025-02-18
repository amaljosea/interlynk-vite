import { useQuery } from '@apollo/client'
import { severityList } from 'variables/general'

import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'
import { Box, Flex } from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'
import useQueryParam from 'hooks/useQueryParam'

import { GetOrgRules } from 'graphQL/Queries'

const CheckFilters = ({ filters, reset }) => {
  const activeTab = useQueryParam('tab')
  const { sbomCheckState, dispatch } = useGlobalState()
  const { sbomCheckDispatch } = dispatch

  const { checkId, category, severity, status } = sbomCheckState

  const { data } = useQuery(GetOrgRules, {
    skip: activeTab === 'checks' ? false : true,
    variables: {
      field: 'RULES_FRIENDLY_ID',
      direction: 'ASC'
    }
  })

  const { checkCategories, checkStatuses } = filters || ''

  const onFilterCheckId = (value) => {
    sbomCheckDispatch({ type: 'SET_CHECKID', payload: value })
    reset()
  }

  const onFilterCategory = (value) => {
    sbomCheckDispatch({ type: 'SET_CATEGORY', payload: value })
    reset()
  }

  const onFilterSeverity = (value) => {
    sbomCheckDispatch({ type: 'SET_SEVERITY', payload: value })
    reset()
  }

  const onFilterStatus = (value) => {
    sbomCheckDispatch({ type: 'SET_STATUS', payload: value })
    reset()
  }

  if (filters) {
    return (
      <Flex gap={2} alignItems={'center'}>
        {/* CHECK ID */}
        {data && (
          <Box width={'fit-content'}>
            <Menu closeOnSelect={false}>
              <MenuHeading title={'Check ID'} active={checkId?.length !== 0} />
              <MenuList
                fontSize={'sm'}
                minHeight={'auto'}
                maxHeight={'300px'}
                overflow={'hidden'}
                overflowY={'scroll'}
              >
                <MenuOptionGroup
                  type='checkbox'
                  value={checkId}
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
            <MenuHeading title={'Category'} active={category?.length !== 0} />
            <CustomList
              value={category}
              options={checkCategories}
              onChange={onFilterCategory}
            />
          </Menu>
        </Box>
        {/* SEVERITY */}
        <Box width={'fit-content'}>
          <Menu closeOnSelect={false}>
            <MenuHeading title={'Severity'} active={severity?.length !== 0} />
            <CustomList
              value={severity}
              onChange={onFilterSeverity}
              options={severityList}
            />
          </Menu>
        </Box>
        {/* STATUS */}
        <Box width={'fit-content'}>
          <Menu closeOnSelect={false}>
            <MenuHeading title={'Resolution'} active={status?.length !== 0} />
            <CustomList
              value={status}
              options={checkStatuses}
              onChange={onFilterStatus}
            />
          </Menu>
        </Box>
      </Flex>
    )
  }

  return null
}

export default CheckFilters
