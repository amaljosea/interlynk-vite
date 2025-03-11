import { useLazyQuery } from '@apollo/client'
import { useState } from 'react'

import { Flex, Kbd, Stack, Text } from '@chakra-ui/react'
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

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetLabels } from 'graphQL/Queries'

import { FaCheck } from 'react-icons/fa6'
import { RxDotFilled } from 'react-icons/rx'

const stages = [
  'all',
  'none',
  'design',
  'development',
  'maintenance',
  'released',
  'end_of_support',
  'end_of_life'
]

const ProdFilterMenu = (props) => {
  const { isFreeTier } = useGlobalQueryContext()

  const { reset, filterMode, setFilterMode, setSelectedTags } = props

  const { prodState, dispatch } = useGlobalState()
  const { enabled, labelIds, lifestage } = prodState || ''
  const { prodDispatch } = dispatch

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
    prodDispatch({
      type: 'FILTER_ACTIVE',
      payload: value
    })
    reset()
  }

  const onFilterLabel = (value) => {
    prodDispatch({
      type: 'FILTER_LABEL',
      payload: value
    })
    reset()
  }

  const onFilterLifestage = (value) => {
    prodDispatch({
      type: 'FILTER_LIFESTAGE',
      payload: value
    })
    reset()
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
      setFilterMode('AND')
    } else {
      setFilterMode('OR')
    }
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
    <Flex gap={2}>
      {/* ACTIVE */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Active'}
          active={enabled !== ''}
          name='active_filter'
        />
        <CustomList
          type='radio'
          onChange={onFilterActive}
          options={['yes', 'no']}
          value={enabled}
        />
      </Menu>
      {/* LABELS */}
      {!isFreeTier && (
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
                    aria-label={`label${index}`}
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
      )}
      {/* LIFE STAGE */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Lifestage'} active={lifestage?.length !== 0} />
        <MenuList
          minW={'280px'}
          maxW={'400px'}
          minH='auto'
          maxH={'320px'}
          fontSize={'sm'}
          overflowY={'scroll'}
        >
          <MenuOptionGroup
            type={'checkbox'}
            value={lifestage}
            onChange={onFilterLifestage}
          >
            {stages?.map((item, index) => (
              <MenuItemOption
                key={index}
                fontSize={'sm'}
                value={item}
                textTransform={'capitalize'}
              >
                {item?.replaceAll('_', ' ')}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default ProdFilterMenu
