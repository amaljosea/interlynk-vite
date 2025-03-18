import { useMemo } from 'react'
import { parseLicenseString } from 'utils'

import { Flex, Tag, TagLabel, Text } from '@chakra-ui/react'

import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

const LicenseColumns = () => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  const { isCustomerView } = useRouteFlags()

  return useMemo(() => {
    const columns = [
      // LICENSE EXPRESSION
      {
        id: 'LICENSE_EXPRESSION',
        name: 'LICENSE EXPRESSION',
        width: isCustomerView ? '' : '50%',
        wrap: true,
        selector: ({ licenseExpression }) => {
          return (
            <Flex direction='row' alignItems={'center'} gap={2}>
              <Text color={primaryTextColor} my={3} fontWeight={'medium'}>
                {parseLicenseString(licenseExpression) || 'Not Available'}
              </Text>
            </Flex>
          )
        }
      },
      // COMPONENTS
      {
        id: 'COMPONENTS',
        name: 'COMPONENTS',
        wrap: true,
        selector: ({ components }) => {
          let sortedComponents = [...components]
          sortedComponents.sort((a, b) => a.name.localeCompare(b.name))

          return (
            <Flex
              direction='row'
              py={5}
              alignItems={'center'}
              wrap='wrap'
              gap={2}
              onClick={(e) => {
                e.currentTarget.parentElement.click()
              }}
            >
              <Tag variant='subtle'>
                <TagLabel my={1} style={{ whiteSpace: 'normal' }}>
                  {sortedComponents[0]?.name}
                </TagLabel>
              </Tag>
              <Text color={primaryTextColor}>
                {sortedComponents.length > 1
                  ? `+${sortedComponents.length - 1} more`
                  : ''}
              </Text>
            </Flex>
          )
        }
      },
      // STATUS
      {
        id: 'STATUS',
        name: 'STATUS',
        wrap: true,
        sortable: true,
        selector: ({ derivedState }) => {
          derivedState = derivedState?.toLowerCase() || 'Not Available'
          return (
            <Tag
              size='md'
              variant='subtle'
              colorScheme={
                derivedState === 'approved'
                  ? 'green'
                  : derivedState === 'rejected'
                    ? 'red'
                    : derivedState === 'unspecified'
                      ? 'orange'
                      : 'blue'
              }
              width={'110px'}
            >
              <TagLabel mx={'auto'} textTransform={'capitalize'}>
                {derivedState}
              </TagLabel>
            </Tag>
          )
        },
        right: 'true',
        omit: isCustomerView ? true : false
      }
    ]

    return columns
  }, [primaryTextColor, isCustomerView])
}

export default LicenseColumns
