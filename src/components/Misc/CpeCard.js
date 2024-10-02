import { Divider, Grid, Stack, Tag, TagLabel, TagRightIcon, Text, useClipboard } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { FaCheck, FaCircleInfo, FaRegCopy } from 'react-icons/fa6'
import InfoTag from './InfoTag'

const CpeCard = ({ value, isOpen, onClose }) => {
  const cpe = useClipboard(value)

  // eslint-disable-next-line no-useless-escape
  const filterString = value?.replace(/[\[\]"]/g, '') || ''
  const cpeString = filterString.split(':')

  const setType = (value) => {
    switch (value) {
      case 'a':
        return 'application'
      case 'h':
        return 'hardware'
      case 'o':
        return 'operating system'
      default:
        return ''
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'CPE Details'}
      Icon={FaCircleInfo}
      noFooter
    >
      <Stack spacing={1}>
        <Tag sx={{ py: 2, mb:1, fontSize: 'sm', wordBreak: 'break-all' }}>
          <TagLabel>{value}</TagLabel>
          <TagRightIcon ml={'auto'} cursor={'pointer'} onClick={() => cpe.onCopy()}>
            {cpe.hasCopied ? <FaCheck size={24} /> : <FaRegCopy size={24} />}
          </TagRightIcon>
        </Tag>
        <Divider />
        <Stack spacing={2} pt={1}>
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Part</Text>
            {cpeString[2] && <InfoTag>{setType(cpeString[2])}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Vendor</Text>
            {cpeString[3] && <InfoTag>{cpeString[3]}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Product</Text>
            {cpeString[4] && <InfoTag>{cpeString[4]}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Version</Text>
            {cpeString[5] && <InfoTag>{cpeString[5]}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Update</Text>
            {cpeString[6] && <InfoTag>{cpeString[6]}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Edition</Text>
            {cpeString[7] && <InfoTag>{cpeString[7]}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Language</Text>
            {cpeString[8] && <InfoTag>{cpeString[8]}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>SW Edition</Text>
            {cpeString[9] && <InfoTag>{cpeString[9]}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Target Software</Text>
            {cpeString[10] && <InfoTag>{cpeString[10]}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Hardware</Text>
            {cpeString[11] && <InfoTag>{cpeString[11]}</InfoTag>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Other</Text>
            {cpeString[12] && <InfoTag>{cpeString[12]}</InfoTag>}
          </Grid>
        </Stack>
      </Stack>
    </LynkModal>
  )
}

export default CpeCard
