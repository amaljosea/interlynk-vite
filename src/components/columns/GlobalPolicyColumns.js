import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { timeSince } from 'utils'

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
  Text
} from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import LynkSwitch from 'components/Misc/LynkSwitch'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleCheck, LuCircleX } from 'react-icons/lu'

const GlobalPolicyColumns = ({ action, handleApply }) => {
  const params = useParams()
  const productId = params.productid

  const updatePolicy = useHasPermission({
    parentKey: 'view_policies',
    childKey: 'edit_policies'
  })

  const editProdPolicies = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_product_policies'
  })

  const removePolicy = useHasPermission({
    parentKey: 'view_policies',
    childKey: 'delete_policies'
  })

  const {
    primaryBlueText,
    primaryErrorColor,
    primarySuccessColor,
    primaryTextColor,
    secondaryTextColor
  } = useThemeColor([
    'primaryBlueText',
    'primaryErrorColor',
    'primarySuccessColor',
    'primaryTextColor',
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
              <Text
                fontSize={14}
                color={primaryBlueText}
                data-testid={`policy_${index}`}
              >
                {row?.name}
              </Text>
            </Link>
            <Text fontSize={12} color={secondaryTextColor}>
              {timeSince(row?.updatedAt)}
            </Text>
          </Stack>
        ),
        width: '30%',
        wrap: true
      },
      {
        id: 'NOTIFICATION',
        name: 'NOTIFICATION',
        width: '13%',
        selector: (row) =>
          row?.notificationEnabled ? (
            <LuCircleCheck fontSize={20} color={primarySuccessColor} />
          ) : (
            <LuCircleX fontSize={20} color={primaryErrorColor} />
          ),
        wrap: true
      },
      {
        id: 'EXCLUDED',
        name: 'EXCLUDED',
        width: '15%',
        selector: (row) => {
          const { excludePrimaryComponent, excludeInternalComponent } =
            row || ''
          return (
            <Flex gap={2} flexWrap={'wrap'} alignItems={'center'}>
              {!excludePrimaryComponent && !excludeInternalComponent && (
                <Text fontSize={14} color={primaryTextColor}>
                  N/A
                </Text>
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
        }
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
        width: '12%',
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
        width: '12%',
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
    primarySuccessColor,
    primaryTextColor,
    productId,
    removePolicy,
    secondaryTextColor,
    updatePolicy
  ])
}

export default GlobalPolicyColumns
