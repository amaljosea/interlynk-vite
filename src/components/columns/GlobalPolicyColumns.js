import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getFullDate, timeSince } from 'utils'

import {
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Select,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import LynkSwitch from 'components/Misc/LynkSwitch'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

const GlobalPolicyColumns = ({ action, handleApply }) => {
  const params = useParams()
  const productId = params.productid

  const updatePolicy = useHasPermission({
    parentKey: 'view_policy',
    childKey: 'create_update_policy'
  })

  const editProdPolicies = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_product_policies'
  })

  const removePolicy = useHasPermission({
    parentKey: 'view_policy',
    childKey: 'remove_policy'
  })

  const {
    primaryBlueText,
    primaryTextColor,
    primaryErrorColor,
    secondaryTextColor
  } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor',
    'primaryErrorColor',
    'secondaryTextColor'
  ])

  return useMemo(() => {
    const columns = [
      {
        id: 'ACTIVE',
        name: 'ACTIVE',
        selector: (row) => {
          const { isEnabled } = row
          return (
            <LynkSwitch
              size='md'
              isDisabled={!updatePolicy}
              isChecked={isEnabled}
              onChange={() => action('update_policy_status', row)}
            />
          )
        },
        width: '7%',
        omit: productId
      },
      {
        id: 'POLICY',
        name: 'POLICY',
        selector: (row, index) => (
          <Stack my={4} spacing={1}>
            <Link to={`/vendor/policies/${row?.id}`}>
              <Text color={primaryBlueText} data-testid={`policy_${index}`}>
                {row?.name}
              </Text>
            </Link>
            <Text fontSize={12} color={secondaryTextColor}>
              {timeSince(row?.updatedAt)}
            </Text>
          </Stack>
        ),
        width: productId ? '50%' : '32%',
        wrap: true
      },
      {
        id: 'EXCLUDED',
        name: 'EXCLUDED',
        selector: (row) => {
          const { excludePrimaryComponent, excludeInternalComponent } =
            row || ''
          return (
            <Flex gap={2} alignItems={'center'}>
              {!excludePrimaryComponent && !excludeInternalComponent && (
                <Text color={primaryTextColor}>N/A</Text>
              )}
              {excludePrimaryComponent && (
                <Tag variant='solid' colorScheme='blue'>
                  Primary
                </Tag>
              )}
              {excludeInternalComponent && (
                <Tag variant='solid' colorScheme='cyan'>
                  Internal
                </Tag>
              )}
            </Flex>
          )
        },
        omit: productId
      },
      {
        id: 'CONDITIONS',
        name: 'CONDITIONS',
        selector: (row) => (
          <Tag
            minW={'60px'}
            textTransform={'uppercase'}
            colorScheme={row?.operator === 'any' ? 'red' : 'green'}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {row?.operator}
            </TagLabel>
          </Tag>
        ),
        width: '15%',
        wrap: true
      },
      {
        id: 'RESULT',
        name: 'RESULT',
        selector: (row) => {
          const { resultType } = row
          return (
            <Tag
              minW={'80px'}
              colorScheme={
                resultType === 'inform'
                  ? 'blue'
                  : resultType === 'warn'
                    ? 'yellow'
                    : 'red'
              }
            >
              <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
                {resultType}
              </TagLabel>
            </Tag>
          )
        },
        width: '15%',
        wrap: true
      },
      // EXCLUSION
      {
        id: 'APPLY',
        name: 'APPLY',
        selector: (row) => {
          const { isExcluded } = row
          console.warn('isExcluded', isExcluded)

          return (
            <Select
              size='sm'
              onChange={() => handleApply(row)}
              color={primaryTextColor}
              isDisabled={!editProdPolicies}
              textTransform={'capitalize'}
              value={isExcluded ? 'NO' : 'YES'}
            >
              <option value={'YES'}>Yes</option>
              <option value={'NO'}>No</option>
            </Select>
          )
        },
        right: 'true',
        omit: !productId
      },
      {
        id: 'ACTION',
        name: 'ACTION',
        selector: (row, index) => {
          return (
            <Menu>
              <LynkAction data-testid={`policy_actions_${index}`} />
              <Portal>
                <MenuList fontSize={'sm'}>
                  {/* EDIT POLICY */}
                  <MenuItem
                    isDisabled={!updatePolicy}
                    hidden={productId}
                    onClick={() => action('edit_policy', row)}
                    data-testid={`policy_edit_${index}`}
                  >
                    Edit Policy
                  </MenuItem>
                  {/* DELETE POLICY  */}
                  <MenuItem
                    color={primaryErrorColor}
                    isDisabled={!removePolicy}
                    hidden={productId}
                    data-testid={`policy_delete_${index}`}
                    onClick={() => action('delete_policy', row)}
                  >
                    Delete Policy
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )
        },
        width: '10%',
        right: 'true',
        omit: productId
      }
    ]

    return columns
  }, [
    action,
    editProdPolicies,
    handleApply,
    primaryBlueText,
    primaryErrorColor,
    primaryTextColor,
    productId,
    removePolicy,
    secondaryTextColor,
    updatePolicy
  ])
}

export default GlobalPolicyColumns
