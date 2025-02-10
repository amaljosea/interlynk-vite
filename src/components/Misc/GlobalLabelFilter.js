import { useLazyQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'
import { Box, SkeletonText } from '@chakra-ui/react'

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

  const [labels, setLabels] = useState([{ id: 'all', name: 'All' }])

  const onFilterLabel = (value) => {
    setValue(value?.includes('all') ? [] : value)
    globalVulnDispatch({ type: 'FILTER_LABEL', payload: value })
  }

  const [getLabels, { loading }] = useLazyQuery(GetLabels)

  const onCheckLabels = async () => {
    await getLabels({ variables: { first: 100 } }).then((res) => {
      if (res?.data?.labels?.nodes?.length > 0) {
        const labels = [{ id: 'all', name: 'All', color: secondaryTextColor }]
        res?.data?.labels?.nodes?.map((item) =>
          labels?.push({
            id: item?.id,
            name: item?.name,
            color: item?.color
          })
        )
        setLabels(labels)
      }
    })
  }

  return (
    <>
      {!isFreeTier && (
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Labels'}
            active={value?.length !== 0}
            onClick={onCheckLabels}
          />
          <MenuList
            minH='auto'
            maxH={'300px'}
            fontSize={'sm'}
            overflowY={'scroll'}
          >
            {loading ? (
              <Box px={2}>
                <SkeletonText noOfLines={4} spacing='3' skeletonHeight='2' />
              </Box>
            ) : (
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
            )}
          </MenuList>
        </Menu>
      )}
    </>
  )
}

export default GlobalLabelFilter
