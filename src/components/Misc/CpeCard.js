import { Divider, Grid, Stack, Tag, Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { FaCircleInfo } from 'react-icons/fa6'

const CpeText = ({ children }) => (
  <Tag
    width={'130px'}
    justifyContent={'center'}
    ml={'auto'}
    size='sm'
    variant='subtle'
    colorScheme={'blue'}
    wordBreak={'break-all'}
    py={1}
    textAlign={'center'}
    alignItems={'center'}
  >
    {children}
  </Tag>
)

const CpeCard = ({ value, isOpen, onClose }) => {
  // eslint-disable-next-line no-useless-escape
  const filterString = value?.replace(/[\[\]"]/g, '') || ''
  const cpeString = filterString.split(':')

  console.log('cpeString', cpeString)

  console.log('cpeString', cpeString)

  const setType = (value) => {
    switch (value) {
      case 'a':
        return 'Application'
      case 'h':
        return 'Hardware'
      case 'o':
        return 'Operating System'
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
        <Tag
          justifyContent={'center'}
          alignItems={'center'}
          fontSize={'sm'}
          py={2}
          wordBreak={'break-all'}
        >
          {value}
        </Tag>
        <Divider />
        <Stack spacing={2} py={3}>
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Part</Text>
            {cpeString[2] && <CpeText>{setType(cpeString[2])}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Vendor</Text>
            {cpeString[3] && <CpeText>{cpeString[3]}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Product</Text>
            {cpeString[4] && <CpeText>{cpeString[4]}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Version</Text>
            {cpeString[5] && <CpeText>{cpeString[5]}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Update</Text>
            {cpeString[6] && <CpeText>{cpeString[6]}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Edition</Text>
            {cpeString[7] && <CpeText>{cpeString[7]}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Language</Text>
            {cpeString[8] && <CpeText>{cpeString[8]}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>SW Edition</Text>
            {cpeString[9] && <CpeText>{cpeString[9]}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Target Software</Text>
            {cpeString[10] && <CpeText>{cpeString[10]}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Hardware</Text>
            {cpeString[11] && <CpeText>{cpeString[11]}</CpeText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Other</Text>
            {cpeString[12] && <CpeText>{cpeString[12]}</CpeText>}
          </Grid>
        </Stack>
      </Stack>
    </LynkModal>
  )
}

export default CpeCard
