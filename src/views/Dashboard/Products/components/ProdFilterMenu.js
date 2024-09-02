import { useQuery } from '@apollo/client'
import { hexToRGBA } from 'utils'

import {
  Box,
  IconButton,
  Kbd,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  Tag,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { GetLabels } from 'graphQL/Queries'

import { FaCheck } from 'react-icons/fa6'
import { RxDotFilled } from 'react-icons/rx'

const ItemCheck = ({ icon }) => {
  return (
    <IconButton size='12' bg={'none'} _hover={{ bg: 'none' }} icon={icon} />
  )
}

const ProdFilterMenu = ({
  filters,
  setFilters,
  filterMode,
  setFilterMode,
  setSelectedTags
}) => {
  const { enabled, labelIds } = filters || ''
  const iconColor = useColorModeValue('#444', '#f3f3f3')
  const bgColor = useColorModeValue('#fff', '#1A202C')
  const borderColor = useColorModeValue('#E2E8F0', '#2D3748')

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

  const handleMenuClick = (event, value) => {
    if (event.shiftKey) {
      console.log('Shift key was held down during selection!', value)
      setFilterMode('AND')
    } else {
      console.log('No Shift key.', value)
      setFilterMode('OR')
    }
    console.log('Selected value:', value)
    if (value !== 'All') {
      setSelectedTags((prevTags) =>
        prevTags.includes(value)
          ? prevTags.filter((t) => t !== value)
          : [...prevTags, value]
      )
    } else {
      setSelectedTags([])
    }
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
        display={nodes?.length > 0 ? 'flex' : 'none'}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Labels'} active={labelIds?.length !== 0} />
          <MenuList
            minW={'280px'}
            maxW={'400px'}
            minH='auto'
            maxH={'320px'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type={'checkbox'}
              value={labelIds}
              onChange={onFilterLabel}
            >
              {prodLabels?.map((item, index) => (
                <MenuItemOption
                  key={index}
                  fontSize={'sm'}
                  value={item?.id}
                  wordBreak={'break-all'}
                  onClick={(e) => handleMenuClick(e, item?.name)}
                  icon={
                    filterMode === 'AND' ? (
                      <ItemCheck
                        icon={<FaCheck size={14} color={iconColor} />}
                      />
                    ) : (
                      <ItemCheck
                        icon={<RxDotFilled size={16} color={iconColor} />}
                      />
                    )
                  }
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
            <Stack
              px={3}
              py={2}
              left={0}
              right={0}
              bottom={-14}
              bg={bgColor}
              pos='absolute'
              borderBottomRadius={5}
              border={`1px solid ${borderColor}`}
            >
              <Text fontSize={'xs'}>
                Use <Kbd>alt</Kbd> + <Kbd>click/return</Kbd> to exclude labels
              </Text>
              <Text fontSize={'xs'}>
                or <Kbd>⇧</Kbd> + <Kbd>click/return</Kbd> for logical OR
              </Text>
            </Stack>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default ProdFilterMenu
