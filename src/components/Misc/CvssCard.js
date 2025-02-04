import { getCvssObject, getCvssVersion, getFormatedCvss } from 'utils/cvssUtils'

import {
  Divider,
  Flex,
  Input,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useClipboard
} from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'

import CopyButton from 'components/Icons/CopyButton'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaCircleInfo } from 'react-icons/fa6'

const CvssText = ({ children }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return (
    <Text
      fontSize='xs'
      textAlign={'left'}
      fontWeight={'medium'}
      color={primaryTextColor}
    >
      {children}
    </Text>
  )
}

const CvssTag = ({ color, children }) => (
  <Tag
    size='sm'
    ml={'auto'}
    minW='120px'
    variant='subtle'
    maxW='fit-content'
    colorScheme={color}
    justifyContent={'center'}
  >
    <TagLabel>{children}</TagLabel>
  </Tag>
)

const CvssCard = ({ isOpen, onClose, value }) => {
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])
  const cvss = useClipboard(value)

  const version = getCvssVersion(value)
  const CVSS = getCvssObject(value)
  const output = getFormatedCvss(version, CVSS)

  const colorScheme = {
    High: 'red',
    Low: 'orange',
    Medium: 'yellow',
    Passive: 'purple',
    Present: 'green',
    Active: 'green',
    None: 'gray',
    Network: 'cyan',
    Required: 'pink',
    Local: 'cyan'
  }

  return (
    <LynkModal
      noFooter
      isOpen={isOpen}
      onClose={onClose}
      Icon={FaCircleInfo}
      title={'CVSS Vector'}
    >
      <Stack spacing={2}>
        <Flex gap={2} mb={1} alignItems={'center'}>
          <Input
            isReadOnly
            fontSize={'sm'}
            defaultValue={value}
            _focus={{ boxShadow: 'none' }}
          />
          <CopyButton
            onCopy={() => cvss?.onCopy()}
            hasCopied={cvss?.hasCopied}
            size='md'
          />
        </Flex>
        <VStack align='stretch' spacing={2} py={2}>
          {output ? (
            Object.entries(output)?.map(([key, item]) => (
              <Stack mt={0} key={key} spacing={1}>
                <SimpleGrid mb={1} columns={2} flexWrap={'wrap'}>
                  <CvssText>{key}</CvssText>
                  <CvssTag color={colorScheme[item] || 'blue'}>{item}</CvssTag>
                </SimpleGrid>
                <Divider />
              </Stack>
            ))
          ) : (
            <Text color={secondaryTextColor}>No record to display</Text>
          )}
        </VStack>
      </Stack>
    </LynkModal>
  )
}

export default CvssCard
