import { PackageURL } from 'packageurl-js'

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { Divider, Flex, IconButton, Input, Stack, Text } from '@chakra-ui/react'
import { useClipboard } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaCheck, FaCircleInfo, FaRegCopy } from 'react-icons/fa6'

import InfoTag from './InfoTag'

const PurlCard = ({ value, isOpen, onClose }) => {
  const purl = useClipboard(decodeURI(value))

  const purlString = () => {
    try {
      const data = PackageURL.fromString(decodeURI(value))
      return data
    } catch (error) {
      console.log('error', error)
    }
  }

  const { primaryErrorColor, primarySuccessColor } = useThemeColor([
    'primaryErrorColor',
    'primarySuccessColor'
  ])

  return (
    <LynkModal
      maxW='500px'
      isOpen={isOpen}
      onClose={onClose}
      title={'PURL Details'}
      Icon={FaCircleInfo}
      noFooter
    >
      <Stack spacing={1}>
        <Flex gap={2} mb={1} alignItems={'center'}>
          <Input
            isReadOnly
            fontSize={'sm'}
            defaultValue={decodeURI(value)}
            _focus={{ boxShadow: 'none' }}
          />
          <IconButton
            onClick={() => purl.onCopy()}
            colorScheme={purl?.hasCopied ? 'green' : 'gray'}
            icon={purl?.hasCopied ? <FaCheck /> : <FaRegCopy />}
          />
        </Flex>
        <Stack spacing={2} pt={1}>
          <Flex gap={4} alignItems={'center'} justifyContent={'space-between'}>
            <Text fontSize={'sm'}>Type</Text>
            <InfoTag>{purlString(value)?.type || 'N/A'}</InfoTag>
          </Flex>
          <Divider />
          <Flex gap={4} alignItems={'center'} justifyContent={'space-between'}>
            <Text fontSize={'sm'}>Namespace</Text>
            <InfoTag>{purlString(value)?.namespace || 'N/A'}</InfoTag>
          </Flex>
          <Divider />
          <Flex gap={4} alignItems={'center'} justifyContent={'space-between'}>
            <Text fontSize={'sm'}>Package Name</Text>
            <InfoTag>{purlString()?.name || 'N/A'}</InfoTag>
          </Flex>
          <Divider />
          <Flex gap={4} alignItems={'center'} justifyContent={'space-between'}>
            <Text fontSize={'sm'}>Package Version</Text>
            <InfoTag>{purlString()?.version || 'N/A'}</InfoTag>
          </Flex>
          <Divider />
          <Flex gap={4} alignItems={'center'} justifyContent={'space-between'}>
            <Text fontSize={'sm'}>Qualifiers</Text>
            <InfoTag>
              {purlString()?.qualifiers
                ? JSON.stringify(purlString()?.qualifiers)
                : 'N/A'}
            </InfoTag>
          </Flex>
          <Divider />
          <Flex gap={4} alignItems={'center'} justifyContent={'space-between'}>
            <Text fontSize={'sm'}>Validity</Text>
            <Flex alignItems={'flex-end'} justifyContent={'flex-end'}>
              {purlString() ? (
                <CheckCircleIcon color={primarySuccessColor} />
              ) : (
                <WarningIcon color={primaryErrorColor} />
              )}
            </Flex>
          </Flex>
        </Stack>
      </Stack>
    </LynkModal>
  )
}

export default PurlCard
