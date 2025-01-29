import { gql, useLazyQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'
import { Box, Button, SkeletonText } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaFilter } from 'react-icons/fa'

export const getProjectGroups = gql`
  query getProjectGroups($first: Int) {
    organization {
      projectGroups(first: $first) {
        nodes {
          id
          name
        }
      }
    }
  }
`

const GlobalLabelFilter = ({ value, setValue }) => {
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  const [prodGroups, setProdGroups] = useState([{ id: 'all', name: 'All' }])

  const onFilterLabel = (value) => {
    setValue(value?.includes('all') ? [] : value)
  }

  const [getProjects, { loading }] = useLazyQuery(getProjectGroups)

  const onCheckLabels = async () => {
    await getProjects({ variables: { first: 25 } }).then((res) => {
      if (res?.data?.organization?.projectGroups?.nodes?.length > 0) {
        const results = [{ id: 'all', name: 'All', color: secondaryTextColor }]
        res?.data?.organization?.projectGroups?.nodes?.map((item) =>
          results?.push({
            id: item?.id,
            name: item?.name
          })
        )
        setProdGroups(results)
      }
    })
  }

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={Button}
        colorScheme='blue'
        fontWeight='semibold'
        onClick={onCheckLabels}
        leftIcon={<FaFilter size={14} />}
      >
        Products
      </MenuButton>
      <MenuList minH='auto' maxH={'320px'} fontSize={'sm'} overflowY={'scroll'}>
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
            {prodGroups?.map((item, index) => (
              <MenuItemOption
                key={index}
                fontSize={'sm'}
                value={item?.id}
                wordBreak={'break-all'}
                aria-label={`label${index}`}
              >
                {item?.name}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        )}
      </MenuList>
    </Menu>
  )
}

export default GlobalLabelFilter
