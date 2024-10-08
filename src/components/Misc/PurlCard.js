import { PackageURL } from 'packageurl-js'

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { Divider, Flex, Grid, Stack, Text } from '@chakra-ui/react'
import { Tag, TagLabel, TagRightIcon } from '@chakra-ui/react'
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
        <Tag sx={{ py: 2, mb: 1, fontSize: 'sm', wordBreak: 'break-all' }}>
          <TagLabel>{decodeURI(value)}</TagLabel>
          <TagRightIcon
            ml={'auto'}
            cursor={'pointer'}
            onClick={() => purl.onCopy()}
          >
            {purl.hasCopied ? <FaCheck size={24} /> : <FaRegCopy size={24} />}
          </TagRightIcon>
        </Tag>
        <Divider />
        <Stack spacing={2} pt={1}>
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Type</Text>
            <InfoTag>{purlString(value)?.type || 'N/A'}</InfoTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Namespace</Text>
            <InfoTag>{purlString(value)?.namespace || 'N/A'}</InfoTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Package Name</Text>
            <InfoTag>{purlString()?.name || 'N/A'}</InfoTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Package Version</Text>
            <InfoTag>{purlString()?.version || 'N/A'}</InfoTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Qualifiers</Text>
            <InfoTag>
              {purlString()?.qualifiers
                ? JSON.stringify(purlString()?.qualifiers)
                : 'N/A'}
            </InfoTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Validity</Text>
            <Flex alignItems={'flex-end'} justifyContent={'flex-end'}>
              {purlString() ? (
                <CheckCircleIcon color={primarySuccessColor} />
              ) : (
                <WarningIcon color={primaryErrorColor} />
              )}
            </Flex>
          </Grid>
        </Stack>
      </Stack>
    </LynkModal>
  )
}

export default PurlCard
