import { PackageURL } from 'packageurl-js'

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import {
  Divider,
  Flex,
  Grid,
  Stack,
  Tag,
  TagLabel,
  TagRightIcon,
  Text,
  useClipboard
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaCheck, FaCircleInfo, FaRegCopy } from 'react-icons/fa6'

import InfoTag from './InfoTag'

const PurlCard = ({ value, isOpen, onClose }) => {
  const purl = useClipboard(value)

  const purlString = () => {
    try {
      const data = PackageURL.fromString(value)
      return data
    } catch (error) {
      console.log('error', error)
    }
  }

  const { primaryErrorColor, primarySuccessColor } = useThemeColor([ 'primaryErrorColor', 'primarySuccessColor'])


  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'PURL Details'}
      Icon={FaCircleInfo}
      noFooter
    >
      <Stack spacing={1}>
        <Tag sx={{ py: 2, mb:1, fontSize: 'sm', wordBreak: 'break-all' }}>
          <TagLabel>{value}</TagLabel>
          <TagRightIcon ml={'auto'} cursor={'pointer'} onClick={() => purl.onCopy()}>
            {purl.hasCopied ? <FaCheck size={24} /> : <FaRegCopy size={24} />}
          </TagRightIcon>
        </Tag>
        <Divider />
        <Stack spacing={2} pt={1}>
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Type</Text>
            {purlString(value)?.type && (
              <InfoTag>{purlString(value)?.type}</InfoTag>
            )}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Namespace</Text>
            {purlString(value)?.namespace && (
              <InfoTag>{purlString(value)?.namespace}</InfoTag>
            )}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Package Name</Text>
            {purlString()?.name && <InfoTag>{purlString()?.name}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Package Version</Text>
            {purlString()?.version && (
              <InfoTag>{purlString()?.version}</InfoTag>
            )}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Qualifiers</Text>
            {purlString()?.qualifiers && (
              <InfoTag>{JSON.stringify(purlString()?.qualifiers)}</InfoTag>
            )}
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
