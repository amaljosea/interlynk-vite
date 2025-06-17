import { SimpleGrid, Stack, Text } from '@chakra-ui/react'

import VulnBadge from './VulnBadge'

const { useProductUrlContext } = require('hooks/useProductUrlContext')

const SeverityInfo = ({ data, onClick }) => {
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { stats, id, vulnRunStatus } = data || {}
  const notStarted = vulnRunStatus === 'NOT_STARTED'

  const link = generateProductVersionDetailPageUrlFromCurrentUrl({
    sbomid: id,
    paramsObj: {
      tab: 'vulnerabilities'
    }
  })

  const vulnStats = [
    { label: 'medium', color: 'yellow', value: stats?.vulnStats?.medium || 0 },
    { label: 'low', color: 'green', value: stats?.vulnStats?.low || 0 },
    { label: 'unknown', color: 'gray', value: stats?.vulnStats?.unknown || 0 }
  ]

  return (
    <Stack w={'100%'} spacing={2} py={1}>
      {vulnStats.map((item, index) => (
        <SimpleGrid key={index} columns={2} gap={2}>
          <Text fontSize={14} textTransform={'capitalize'}>
            {item.label}
          </Text>
          <VulnBadge
            color={item.color}
            status={vulnRunStatus}
            onClick={() => onClick([item.label], id, link)}
          >
            {notStarted ? '-' : item.value}
          </VulnBadge>
        </SimpleGrid>
      ))}
    </Stack>
  )
}

export default SeverityInfo
