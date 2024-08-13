import { useQuery } from '@apollo/client'
import { hexToRGBA } from 'utils'

import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  Tag
} from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { GetLabels } from 'graphQL/Queries'

const ProdFilterMenu = ({ filters, setFilters }) => {
  const { enabled, labelIds } = filters || ''
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const onFilterActive = (value) => {
    setFilters((oldFilter) => ({
      ...oldFilter,
      enabled: value === 'yes' ? true : value === 'no' ? false : undefined
    }))
  }

  const onFilterLabel = (value) => {
    setFilters((oldFilter) => ({
      ...oldFilter,
      labelIds: value?.includes('all') ? [] : value
    }))
  }

  const { data } = useQuery(GetLabels, {
    variables: { first: 100 }
  })
  const { nodes } = data?.labels || ''

  const prodLabels = [{ id: 'all', name: 'All', color: '#CBD5E0' }]
  if (nodes?.length > 0) {
    nodes?.map((item) =>
      prodLabels?.push({ id: item?.id, name: item?.name, color: item?.color })
    )
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ACTIVE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Active'} active={enabled !== undefined} />
          <CustomList
            type='radio'
            onChange={onFilterActive}
            options={['yes', 'no']}
            value={enabled === true ? 'yes' : enabled === false ? 'no' : 'all'}
          />
        </Menu>
      </Box>
      {/* LABELS */}
      <Box
        width={'fit-content'}
        position={'relative'}
        display={shouldShowDemoFeatures ? 'flex' : 'none'}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Labels'} active={labelIds?.length !== 0} />
          <MenuList minH='auto' maxH={'320px'} overflowY={'scroll'}>
            <MenuOptionGroup
              type={'checkbox'}
              value={labelIds}
              onChange={onFilterLabel}
            >
              {prodLabels?.map((item, index) => (
                <MenuItemOption
                  key={index}
                  maxW={'300px'}
                  fontSize={'sm'}
                  value={item?.id}
                  wordBreak={'break-all'}
                >
                  <Tag
                    width={'fit-content'}
                    borderColor={item?.color}
                    bg={hexToRGBA(item?.color, 0.5)}
                  >
                    {item?.name}
                  </Tag>
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default ProdFilterMenu
