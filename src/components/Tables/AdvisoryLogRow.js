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


function AdvisoryLogRow(props) {
  const { ID, desc, source, updated, severity, affected, aliases } = props
  const textColor = useColorModeValue('gray.700', 'white')
  const bgStatus = useColorModeValue('gray.400', '#1a202c')
  const colorStatus = useColorModeValue('white', 'gray.400')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()

  // set value of icon based on type
  let icon
  let color
  let tooltip
  let link
  switch (source) {
    case 'NVD':
      icon = FaNeos
      color = 'black'
      tooltip = 'National Vulnerability Database (NVD)'
      link = 'https://nvd.nist.gov/vuln/detail/' + ID
      break
    case 'GHSA':
      icon = FaTools
      tooltip = 'Github Security Advisory'
      link = 'https://github.com/advisories/' + ID
      color = 'black'
      break
    case 'USN':
      icon = FaTools
      tooltip = 'Ubuntu Security Advisory'
      link = 'https://ubuntu.com/security/notices/' + ID
      color = 'black'
      break
  }
  const sevColor =
    severity == 'Critical'
      ? 'red'
      : severity == 'High'
      ? 'orange'
      : severity == 'Medium'
      ? 'yellow'
      : 'green'

  const [operatingSystem, setOperatingSystem] = useState('')

  useEffect(() => {
    const userAgent = window.navigator.userAgent
    if (userAgent.match(/Windows/i)) {
      setOperatingSystem('Windows')
    } else if (userAgent.match(/Mac/i)) {
      setOperatingSystem('MacOS')
    } else if (userAgent.match(/Linux/i)) {
      setOperatingSystem('Linux')
    } else if (userAgent.match(/Android/i)) {
      setOperatingSystem('Android')
    } else if (userAgent.match(/iOS|iPad|iPhone/i)) {
      setOperatingSystem('iOS')
    } else {
      setOperatingSystem('Unknown')
    }
  }, [])

  return (
    <Tr>
      <Td width={'250px'} pl='0px'>
        <Flex align='center' py='.2rem' minWidth='100%' flexWrap='nowrap'>
          <Link href={link} isExternal>
            <Flex direction='row' gap={2} alignItems={'flex-start'}>
              <Icon as={ExternalLinkIcon} h={'16px'} w={'16px'} me='5px' />
              <Flex flexDirection={'column'} alignItems={'self-start'} gap={2}>
                <Text fontSize='sm' color={textColor} minWidth='100%'>
                  {ID}
                </Text>
                <Tooltip label={tooltip} aria-label={tooltip}>
                  <Tag size='sm' colorScheme='blue' variant='outline'>
                    {source}
                  </Tag>
                </Tooltip>
              </Flex>
            </Flex>
          </Link>
        </Flex>
      </Td>
      <Td width={{ sm: '500px' }}>{desc}</Td>
      <Td width={'150px'}>
        <Text fontSize='sm' color={textColor}>
          {updated}
        </Text>
      </Td>
      <Td>
        <Text fontSize='sm' color={textColor}>
          <Tag size='md' key='md' variant='subtle' colorScheme={sevColor}>
            <TagLabel>{severity ? severity : 'Unknown'}</TagLabel>
          </Tag>
        </Text>
      </Td>
      <Td width={'100px'}>
        <Flex direction='column'>
          {affected.map((entry, index) => (
            <Text fontSize='sm' color={textColor} key={index}>
              {entry}
            </Text>
          ))}
        </Flex>
      </Td>
      <Td>
        <Flex direction='column'>
          {aliases.map((alias, index) => (
            <Flex direction='row' key={index}>
              <Icon as={ExternalLinkIcon} h={'16px'} w={'16px'} me='5px' />
              <Text fontSize='sm'>{alias}</Text>
            </Flex>
          ))}
        </Flex>
      </Td>
    </Tr>
  )
}

export default AdvisoryLogRow
