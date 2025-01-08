import { timeSince } from 'utils'

import {
  Flex,
  Link,
  Tag,
  TagLabel,
  Td,
  Text,
  Tooltip,
  Tr
} from '@chakra-ui/react'

import ExternalNavIcon from 'components/Icons/ExternalNavIcon'

import { useThemeColor } from 'hooks/useThemeColors'

function AdvisoryLogRow(props) {
  const {
    refId,
    desc,
    source,
    publishedAt,
    updatedAt,
    severity,
    affected,
    aliasId
  } = props
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])
  // set value of icon based on type
  let tooltip
  let link
  switch (source) {
    case 'nvd':
      tooltip = 'National Vulnerability Database (NVD)'
      link = 'https://nvd.nist.gov/vuln/detail/' + refId
      break
    case 'ghsa':
      tooltip = 'Github Security Advisory'
      link = 'https://github.com/advisories/' + refId
      break
    case 'usn':
      tooltip = 'Ubuntu Security Advisory'
      link = 'https://ubuntu.com/security/notices/' + refId
      break
  }
  const sevColor =
    severity == 'critical'
      ? 'red'
      : severity == 'high'
        ? 'orange'
        : severity == 'medium'
          ? 'yellow'
          : 'green'

  return (
    <Tr>
      <Td width={'250px'} pl='0px'>
        <Flex align='center' py='.2rem' minWidth='100%' flexWrap='nowrap'>
          <Link href={link} target='_blank'>
            <Flex direction='row' gap={2} alignItems={'flex-start'}>
              <ExternalNavIcon styles={{ me: '5px' }} />
              <Flex flexDirection={'column'} alignItems={'self-start'} gap={2}>
                <Text
                  fontSize='sm'
                  color={inverseSecondaryBgColor}
                  minWidth='100%'
                >
                  {refId}
                </Text>
                <Tooltip label={tooltip} aria-label={tooltip}>
                  <Tag
                    size='sm'
                    colorScheme='blue'
                    variant='outline'
                    textTransform={'uppercase'}
                  >
                    {source}
                  </Tag>
                </Tooltip>
              </Flex>
            </Flex>
          </Link>
        </Flex>
      </Td>
      <Td width={{ sm: '500px' }}>{desc.substring(0, 100)}...</Td>
      <Td width={'150px'}>
        <Text fontSize='sm' color={inverseSecondaryBgColor}>
          {timeSince(publishedAt)}
        </Text>
      </Td>
      <Td width={'150px'}>
        <Text fontSize='sm' color={inverseSecondaryBgColor}>
          {timeSince(updatedAt)}
        </Text>
      </Td>
      <Td>
        {severity && (
          <Text fontSize='sm' color={inverseSecondaryBgColor}>
            <Tag size='md' key='md' variant='subtle' colorScheme={sevColor}>
              <TagLabel>{severity}</TagLabel>
            </Tag>
          </Text>
        )}
      </Td>
      <Td width={'100px'}>
        <Flex direction='column'>{affected ? affected : ''}</Flex>
      </Td>
      <Td>
        <Flex direction='column'>{aliasId ? aliasId : ''}</Flex>
      </Td>
    </Tr>
  )
}

export default AdvisoryLogRow
