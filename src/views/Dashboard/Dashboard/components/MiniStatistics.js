import { Flex, Stat, StatLabel, StatNumber, Tag } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import IconBox from 'components/Icons/IconBox'

import { useThemeColor } from 'hooks/useThemeColors'

const MiniStatistics = ({ title, amount, icon }) => {
  const { primaryBlueText, inverseSecondaryBgColor, primaryBgColor } =
    useThemeColor([
      'primaryBlueText',
      'inverseSecondaryBgColor',
      'primaryBgColor'
    ])

  const fontStyle = { fontSize: title === 'Vulnerabilities' ? '12px' : '14px' }
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
                <Tag variant='subtle' colorScheme='red' sx={fontStyle}>
                  {amount?.critical || 0}
                </Tag>
                <Tag variant='subtle' colorScheme='orange' sx={fontStyle}>
                  {amount?.high || 0}
                </Tag>
                <Tag variant='subtle' colorScheme='yellow' sx={fontStyle}>
                  {amount?.medium || 0}
                </Tag>
                <Tag variant='subtle' colorScheme='green' sx={fontStyle}>
                  {amount?.low || 0}
                </Tag>
                <Tag variant='subtle' colorScheme='gray' sx={fontStyle}>
                  {amount?.unknown || 0}
                </Tag>
              </Flex>
            ) : (
              <StatNumber fontSize='lg' color={inverseSecondaryBgColor}>
                {amount || 0}
              </StatNumber>
            )}
          </Stat>
          <IconBox
            h={'45px'}
            w={'45px'}
            color={primaryBgColor}
            bg={primaryBlueText}
          >
            {icon}
          </IconBox>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default MiniStatistics
