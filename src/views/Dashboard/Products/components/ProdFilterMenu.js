import { useLazyQuery } from '@apollo/client'
import { useState } from 'react'

import { Box, Kbd, Stack, Text } from '@chakra-ui/react'
import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ProdLabel from 'components/Label/ProdLabel'
import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { useThemeColor } from 'hooks/useThemeColors'

import { GetLabels } from 'graphQL/Queries'

import { FaCheck } from 'react-icons/fa6'
import { RxDotFilled } from 'react-icons/rx'

const ProdFilterMenu = (props) => {
  const { filters, setFilters, filterMode, setFilterMode, setSelectedTags } =
    props
  const { enabled, labelIds } = filters || ''

  const {
    primaryBgColor,
    grayBorderColor,
    inverseSecondaryBgColor,
    secondaryTextColor
  } = useThemeColor([
    'primaryBgColor',
    'grayBorderColor',
    'inverseSecondaryBgColor',
    'secondaryTextColor'
  ])

  const [prodLabels, setProdLabels] = useState([
    { id: 'all', name: 'All', color: secondaryTextColor }
  ])

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
        setProdLabels(labels)
      }
    })
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
          <MenuHeading
            title={'Active'}
            active={enabled !== undefined}
            name='active_filter'
          />
          <CustomList
            type='radio'
            onChange={onFilterActive}
            options={['yes', 'no']}
            value={enabled === true ? 'yes' : enabled === false ? 'no' : 'all'}
          />
        </Menu>
      </Box>
      {/* LABELS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Labels'}
            active={labelIds?.length !== 0}
            onClick={onCheckLabels}
          />
          <MenuList
            minW={'280px'}
            maxW={'400px'}
            minH='auto'
            maxH={'320px'}
            fontSize={'sm'}
            overflowY={'scroll'}
          >
            {loading ? (
              <Stack px={2}>
                <CustomLoader />
              </Stack>
            ) : (
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
                        <RxDotFilled
                          size={16}
                          color={inverseSecondaryBgColor}
                        />
                      ) : (
                        <FaCheck size={14} color={inverseSecondaryBgColor} />
                      )
                    }
                  >
                    <ProdLabel item={item} />
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            )}
            <Stack
              px={3}
              py={2}
              left={0}
              right={0}
              bottom={-8}
              bg={primaryBgColor}
              pos='absolute'
              borderBottomRadius={5}
              border={`1px solid ${grayBorderColor}`}
            >
              <Text fontSize={'xs'}>
                Use <Kbd>⇧</Kbd> + <Kbd>click/return</Kbd> for logical AND
              </Text>
            </Stack>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default ProdFilterMenu
