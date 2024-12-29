import { Flex, IconButton, Stat, StatLabel, StatNumber } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import VulnBadge from 'components/Misc/VulnBadge'

import { useThemeColor } from 'hooks/useThemeColors'

const MiniStatistics = ({ title, amount, icon }) => {
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])

  return (
    <Card px={4}>
      <CardBody p={0}>
        <Flex flexDirection='row' align='flex-start' gap={2} w='100%'>
          <Stat me='auto'>
            <StatLabel fontSize='md' pb='.1rem'>
              {title}
            </StatLabel>
            {title === 'Vulnerabilities' ? (
              <Flex mt={1} gap={1} direction={'row'} flexWrap={'wrap'}>
                <VulnBadge color='red' label={'Critical'}>
                  {amount?.critical || 0}
                </VulnBadge>
                <VulnBadge color='orange' label={'High'}>
                  {amount?.high || 0}
                </VulnBadge>
                <VulnBadge color='yellow' label={'Medium'}>
                  {amount?.medium || 0}
                </VulnBadge>
                <VulnBadge color='green' label={'Low'}>
                  {amount?.low || 0}
                </VulnBadge>
                <VulnBadge color='gray' label={'Unknown'}>
                  {amount?.unknown || 0}
                </VulnBadge>
              </Flex>
            ) : (
              <StatNumber fontSize='lg' color={inverseSecondaryBgColor}>
                {amount || 0}
              </StatNumber>
            )}
          </Stat>
          <IconButton colorScheme='blue' icon={icon} />
        </Flex>
      </CardBody>
    </Card>
  )
}

export default MiniStatistics
