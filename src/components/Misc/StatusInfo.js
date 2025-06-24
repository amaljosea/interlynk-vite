import { Flex, Stack, Tag, TagLabel, Text } from '@chakra-ui/react'

const StatusInfo = ({ data }) => {
  const { vulnerabilityMetrics } = data || {}
  const {
    unspecifiedCount,
    inTriageCount,
    affectedCount,
    fixedCount,
    notAffectedCount
  } = vulnerabilityMetrics || {}

  const vulnStatus = [
    {
      label: 'Unspecified',
      color: 'gray',
      value: unspecifiedCount || 0
    },
    {
      label: 'In Triage',
      color: 'cyan',
      value: inTriageCount || 0
    },
    {
      label: 'Affected',
      color: 'red',
      value: affectedCount || 0
    },
    {
      label: 'Not Affected',
      color: 'blue',
      value: notAffectedCount || 0
    },
    {
      label: 'Fixed',
      color: 'green',
      value: fixedCount || 0
    }
  ]

  return (
    <Stack w={'fit-content'} spacing={2} py={1}>
      {vulnStatus.map((item, index) => (
        <Flex key={index} gap={2}>
          <Text w={'130px'} fontSize={14} textTransform={'capitalize'}>
            {item.label}
          </Text>
          <Tag colorScheme={item.color} w={'60px'}>
            <TagLabel mx={'auto'}>{item.value}</TagLabel>
          </Tag>
        </Flex>
      ))}
    </Stack>
  )
}

export default StatusInfo
