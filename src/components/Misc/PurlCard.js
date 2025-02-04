import { PackageURL } from 'packageurl-js'

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { Flex, Input, Stack, Text } from '@chakra-ui/react'
import { useClipboard } from '@chakra-ui/react'

import CopyButton from 'components/Icons/CopyButton'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaCircleInfo } from 'react-icons/fa6'

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

  const { primaryErrorColor, primarySuccessColor, grayBorderColor } =
    useThemeColor([
      'primaryErrorColor',
      'primarySuccessColor',
      'grayBorderColor'
    ])

  const data = [
    { id: 1, label: 'type', value: purlString(value)?.type || 'N/A' },
    { id: 2, label: 'namespace', value: purlString(value)?.namespace || 'N/A' },
    { id: 3, label: 'package name', value: purlString(value)?.name || 'N/A' },
    {
      id: 4,
      label: 'package version',
      value: purlString(value)?.verion || 'N/A'
    },
    {
      id: 5,
      label: 'qualifiers',
      value: purlString()?.qualifiers
        ? JSON.stringify(purlString()?.qualifiers)
        : 'N/A'
    },
    {
      id: 6,
      label: 'validity',
      value: purlString() ? (
        <CheckCircleIcon color={primarySuccessColor} />
      ) : (
        <WarningIcon color={primaryErrorColor} />
      )
    }
  ]

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
          <CopyButton
            onCopy={() => purl.onCopy()}
            hasCopied={purl?.hasCopied}
            size='md'
          />
        </Flex>
        <Stack spacing={2} pt={1}>
          {data?.map((item) => (
            <Flex
              pb={2}
              gap={5}
              w='100%'
              key={item?.id}
              justifyContent={'space-between'}
              borderBottom={`1px solid ${grayBorderColor}`}
            >
              <Text fontSize={'sm'} textTransform={'capitalize'}>
                {item?.label}
              </Text>
              {item?.label === 'validity' ? (
                item?.value
              ) : (
                <InfoTag>{item?.value}</InfoTag>
              )}
            </Flex>
          ))}
        </Stack>
      </Stack>
    </LynkModal>
  )
}

export default PurlCard
