import { useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'

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

  const defaultLabel = useMemo(
    () => [{ id: 'all', name: 'All', color: secondaryTextColor }],
    [secondaryTextColor]
  )

  const [labels, setLabels] = useState(defaultLabel)

  const onFilterLabel = (value) => {
    setValue(value?.includes('all') ? [] : value)
    globalVulnDispatch({ type: 'FILTER_LABEL', payload: value })
  }

  const { data } = useQuery(GetLabels, {
    skip: isFreeTier,
    variables: { first: 100 }
  })

  useEffect(() => {
    if (data?.labels?.nodes?.length > 0) {
      const newLabels = [
        ...defaultLabel,
        ...data.labels.nodes.map((item) => ({
          id: item?.id,
          name: item?.name,
          color: item?.color
        }))
      ]
      setLabels(newLabels)
    }
  }, [data, defaultLabel])

  if (isFreeTier || labels.length <= 1) return null

  return (
    <Menu closeOnSelect={false}>
      <MenuHeading title={'Labels'} active={value?.length !== 0} />
      <MenuList minH='auto' maxH={'300px'} fontSize={'sm'} overflowY={'scroll'}>
        <MenuOptionGroup
          type={'checkbox'}
          value={value}
          onChange={onFilterLabel}
        >
          {labels.map((item, index) => (
            <MenuItemOption
              key={index}
              fontSize={'sm'}
              value={item.id}
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
