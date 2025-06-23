import { useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import {
  Flex,
  Kbd,
  MenuDivider,
  MenuGroup,
  Stack,
  Text
} from '@chakra-ui/react'
import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import ProdLabel from 'components/Label/ProdLabel'
import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetLabels } from 'graphQL/Queries'

import { LuCheck, LuCircleDot } from 'react-icons/lu'

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
  const navigate = useNavigate()
  const { isFreeTier } = useGlobalQueryContext()

  const { reset, filterMode, setFilterMode, setSelectedTags } = props

  const { prodState, dispatch } = useGlobalState()
  const { enabled, labelIds, lifestage } = prodState || {}
  const { prodDispatch } = dispatch

  const { inverseSecondaryBgColor, secondaryTextColor } = useThemeColor([
    'inverseSecondaryBgColor',
    'secondaryTextColor'
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
    navigate('/vendor/products')
    reset()
  }

  const productPermissions = useHasPermission({
    parentKey: 'view_product_group'
  })

  const { data, loading } = useQuery(GetLabels, {
    variables: { first: 200 },
    skip: productPermissions === false || isFreeTier
  })
  const { nodes } = data?.labels || {}

  const prodLabels = [{ id: 'all', name: 'All', color: secondaryTextColor }]
  nodes?.map((item) =>
    prodLabels?.push({
      id: item?.id,
      name: item?.name,
      color: item?.color
    })
  )

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

  const Info = () => (
    <Text fontWeight={'normal'}>
      Use <Kbd>⇧</Kbd> + <Kbd>click/return</Kbd> for logical AND
    </Text>
  )

  const checkIcon =
    filterMode === 'AND' ? (
      <LuCircleDot size={18} color={inverseSecondaryBgColor} />
    ) : (
      <LuCheck size={18} color={inverseSecondaryBgColor} />
    )

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
      {!isFreeTier && !loading && prodLabels?.length > 1 && (
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Labels'} active={labelIds?.length !== 0} />
          <MenuList minW={'280px'} maxW={'400px'}>
            <Stack minH='auto' maxH={'320px'} overflowY={'scroll'}>
              <MenuOptionGroup
                type={'checkbox'}
                value={labelIds}
                onChange={onFilterLabel}
              >
                {prodLabels?.map((item, index) => (
                  <MenuItemOption
                    key={index}
                    fontSize={'sm'}
                    icon={checkIcon}
                    value={item?.id}
                    wordBreak={'break-all'}
                    aria-label={`label${index}`}
                    onClick={(e) => handleMenuClick(e, item?.name)}
                  >
                    <ProdLabel item={item} />
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </Stack>
            <MenuDivider />
            <MenuGroup title={<Info />}></MenuGroup>
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
