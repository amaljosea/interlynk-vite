import React from 'react'

import { Flex, Link, Stack, Tag, Text } from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'

import { useThemeColor } from 'hooks/useThemeColors'

const VulnAdvisoriesModal = ({ data, isOpen, onClose }) => {
  const { vuln } = data
  const { vulnId, vulnInfo } = vuln || {}
  const advisories =
    vulnInfo?.advisories?.length > 0 ? vulnInfo?.advisories : []

  const { primaryBlueText, secondaryTextColor, grayBorderColor } =
    useThemeColor(['primaryBlueText', 'secondaryTextColor', 'grayBorderColor'])

  const container = {
    pb: 2,
    w: '100%',
    gap: 2,
    alignItems: 'flex-start',
    borderBottom: `1px solid ${grayBorderColor}`
  }

  return (
    <LynkDrawer
      title={'Advisories'}
      subtitle={data && <Tag colorScheme='blue'>{vulnId}</Tag>}
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      {advisories?.length > 0 ? (
        <Stack spacing={2}>
          {advisories?.map((item, index) => (
            <Flex fontSize={'sm'} key={index} {...container}>
              <Text>{index + 1}. </Text>
              <Link
                to={item}
                target='_blank'
                style={{ color: primaryBlueText }}
              >
                {item}
              </Link>
            </Flex>
          ))}
        </Stack>
      ) : (
        <Text color={secondaryTextColor}>Not available</Text>
      )}
    </LynkDrawer>
  )
}

export default VulnAdvisoriesModal
