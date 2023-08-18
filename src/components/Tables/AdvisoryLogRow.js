import {
  Tag,
  Icon,
  Flex,
  Td,
  Text,
  Tr,
  TagLabel,
  useColorModeValue,
  useDisclosure,
  Tooltip,
  Link
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { FaTools, FaNeos } from 'react-icons/fa'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { timeSince } from 'utils'

function AdvisoryLogRow(props) {
  const {
    id,
    refId,
    desc,
    source,
    publishedAt,
    updatedAt,
    severity,
    affected,
    aliasId
  } = props
  const textColor = useColorModeValue('gray.700', 'white')

  // set value of icon based on type
  let icon
  let color
  let tooltip
  let link
  switch (source) {
    case 'nvd':
      icon = FaNeos
      color = 'black'
      tooltip = 'National Vulnerability Database (NVD)'
      link = 'https://nvd.nist.gov/vuln/detail/' + refId
      break
    case 'ghsa':
      icon = FaTools
      tooltip = 'Github Security Advisory'
      link = 'https://github.com/advisories/' + refId
      color = 'black'
      break
    case 'usn':
      icon = FaTools
      tooltip = 'Ubuntu Security Advisory'
      link = 'https://ubuntu.com/security/notices/' + refId
      color = 'black'
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
          <Link href={link} isExternal>
            <Flex direction='row' gap={2} alignItems={'flex-start'}>
              <Icon as={ExternalLinkIcon} h={'16px'} w={'16px'} me='5px' />
              <Flex flexDirection={'column'} alignItems={'self-start'} gap={2}>
                <Text fontSize='sm' color={textColor} minWidth='100%'>
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
        <Text fontSize='sm' color={textColor}>
          {timeSince(publishedAt)}
        </Text>
      </Td>
      <Td width={'150px'}>
        <Text fontSize='sm' color={textColor}>
          {timeSince(updatedAt)}
        </Text>
      </Td>
      <Td>
        {severity && (
          <Text fontSize='sm' color={textColor}>
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
        <Flex direction='column'>{aliasId ? aliases : ''}</Flex>
      </Td>
    </Tr>
  )
}

export default AdvisoryLogRow
