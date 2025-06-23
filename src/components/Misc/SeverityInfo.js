/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { getSignedUrlParams } from 'utils'

import {
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  SimpleGrid,
  Stack,
  Tag,
  TagLabel,
  Text
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import VulnBadge from './VulnBadge'

const SeverityInfo = ({ data, link, isUnique = true, onFilter }) => {
  const signedUrlParams = getSignedUrlParams()
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const { id, stats, vulnRunStatus } = data || {}
  const runStatus = vulnRunStatus || 'FINISHED'
  const notStarted = runStatus === 'NOT_STARTED'

  const { vulnStats } = stats || {}
  const { critical, high, ...rest } = vulnStats || {}
  const total = Object.values(rest).reduce((sum, value) => sum + value, 0)

  const [openPopoverId, setOpenPopoverId] = useState(null)

  const severities = [
    {
      label: 'medium',
      color: 'yellow',
      value: vulnStats?.medium || 0
    },
    { label: 'low', color: 'green', value: vulnStats?.low || 0 },
    {
      label: 'unknown',
      color: 'gray',
      value: vulnStats?.unknown || 0
    }
  ]

  return (
    <Flex gap={1} my={3} alignItems={'center'} flexWrap={'wrap'}>
      <VulnBadge
        color='red'
        label='Critical'
        status={vulnRunStatus}
        onClick={() => (isUnique ? onFilter(['critical'], id, link) : null)}
      >
        {notStarted ? '-' : stats?.vulnStats?.critical || 0}
      </VulnBadge>
      <VulnBadge
        color='orange'
        label='High'
        status={vulnRunStatus}
        onClick={() => (isUnique ? onFilter(['high'], id, link) : null)}
      >
        {notStarted ? '-' : stats?.vulnStats?.high || 0}
      </VulnBadge>
      {signedUrlParams && <Text color={primaryTextColor}>+{total}</Text>}
      {runStatus === 'FINISHED' && total !== 0 && (
        <Popover
          placement='right'
          closeOnBlur={false}
          returnFocusOnClose={false}
          isOpen={openPopoverId === id}
          onClose={() => setOpenPopoverId(null)}
        >
          <PopoverTrigger>
            <Tag
              minW={'60px'}
              colorScheme='gray'
              onMouseEnter={() => setOpenPopoverId(id)}
              onMouseLeave={() => setOpenPopoverId(null)}
            >
              <TagLabel mx={'auto'}>+{total}</TagLabel>
            </Tag>
          </PopoverTrigger>
          <Portal>
            <PopoverContent
              zIndex={111}
              width={'200px'}
              overflow={'hidden'}
              color={primaryTextColor}
              onMouseEnter={() => setOpenPopoverId(id)}
              onMouseLeave={() => setOpenPopoverId(null)}
            >
              <PopoverBody>
                <Stack w={'100%'} spacing={2} py={1}>
                  {severities.map((item, index) => (
                    <SimpleGrid key={index} columns={2} gap={2}>
                      <Text fontSize={14} textTransform={'capitalize'}>
                        {item.label}
                      </Text>
                      <VulnBadge
                        color={item.color}
                        status={runStatus}
                        onClick={() =>
                          isUnique ? onFilter([item.label], id, link) : null
                        }
                      >
                        {notStarted ? '-' : item.value}
                      </VulnBadge>
                    </SimpleGrid>
                  ))}
                </Stack>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      )}
    </Flex>
  )
}

export default SeverityInfo
