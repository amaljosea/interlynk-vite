import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import ProdLabel from 'components/Label/ProdLabel'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetLabels } from 'graphQL/Queries'

import MenuHeading from './MenuHeading'

const GlobalLabelFilter = ({ value, setValue }) => {
  const { dispatch } = useGlobalState()
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])
  const { isFreeTier } = useGlobalQueryContext()
  const { globalVulnDispatch } = dispatch

  const [labels, setLabels] = useState([
    { id: 'all', name: 'All', color: secondaryTextColor }
  ])

  const onFilterLabel = (value) => {
    setValue(value?.includes('all') ? [] : value)
    globalVulnDispatch({ type: 'FILTER_LABEL', payload: value })
  }

  const { data } = useQuery(GetLabels, {
    skip: !isFreeTier ? false : true,
    variables: { first: 100 }
  })
  const { nodes } = data?.labels || {}

  useEffect(() => {
    if (nodes?.length > 0) {
      nodes?.map((item) =>
        labels?.push({
          id: item?.id,
          name: item?.name,
          color: item?.color
        })
      )
      setLabels(labels)
    }
  }, [labels, nodes, secondaryTextColor])

  if (isFreeTier || labels?.length === 1) return null

  return (
    <Menu closeOnSelect={false}>
      <MenuHeading title={'Labels'} active={value?.length !== 0} />
      <MenuList minH='auto' maxH={'300px'} fontSize={'sm'} overflowY={'scroll'}>
        <MenuOptionGroup
          type={'checkbox'}
          value={value}
          onChange={onFilterLabel}
        >
          {labels?.map((item, index) => (
            <MenuItemOption
              key={index}
              fontSize={'sm'}
              value={item?.id}
              wordBreak={'break-all'}
              aria-label={`label${index}`}
            >
              <ProdLabel item={item} />
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

export default GlobalLabelFilter
