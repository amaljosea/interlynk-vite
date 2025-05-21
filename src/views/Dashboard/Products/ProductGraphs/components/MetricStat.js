import {
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber
} from '@chakra-ui/react'

const MetricStat = ({ label, total, deltaPercent, deltaDirection }) => (
  <Stat minW='150px' flex='1'>
    <StatLabel isTruncated>{label}</StatLabel>
    <StatNumber fontSize={32} fontWeight='medium'>
      {total}
    </StatNumber>
    <StatHelpText>
      <StatArrow type={deltaDirection} />
      {deltaPercent}%
    </StatHelpText>
  </Stat>
)

export default MetricStat
