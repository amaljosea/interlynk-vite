import { useLazyQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'
import { Box, Button, SkeletonText } from '@chakra-ui/react'

import ProdLabel from 'components/Label/ProdLabel'

import { useThemeColor } from 'hooks/useThemeColors'

import { GetLabels } from 'graphQL/Queries'

import { FaFilter } from 'react-icons/fa'

const GlobalLabelFilter = ({ value, setValue }) => {
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  const [labels, setLabels] = useState([{ id: 'all', name: 'All' }])

  const onFilterLabel = (value) => {
    setValue(value?.includes('all') ? [] : value)
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
    <Menu closeOnSelect={false}>
      <MenuButton
        as={Button}
        fontSize='sm'
        fontWeight='medium'
        colorScheme={'blue'}
        onClick={onCheckLabels}
        leftIcon={<FaFilter size={14} />}
        variant={value?.length > 0 ? 'solid' : 'outline'}
      >
        Labels
      </MenuButton>
      <MenuList minH='auto' maxH={'300px'} fontSize={'sm'} overflowY={'scroll'}>
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
  )
}

export default GlobalLabelFilter
