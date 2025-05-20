import { Flex, Input, Stack, Text, useClipboard } from '@chakra-ui/react'

import CopyButton from 'components/Icons/CopyButton'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuInfo } from 'react-icons/lu'

import InfoTag from './InfoTag'

const CpeCard = ({ value, isOpen, onClose }) => {
  const cpe = useClipboard(value)
  const { grayBorderColor } = useThemeColor(['grayBorderColor'])

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

  const data = [
    { id: 1, label: 'part', value: setType(cpeString[2]) },
    { id: 2, label: 'vendor', value: cpeString[3] },
    { id: 3, label: 'product', value: cpeString[4] },
    { id: 4, label: 'version', value: cpeString[5] },
    { id: 5, label: 'update', value: cpeString[6] },
    { id: 6, label: 'edition', value: cpeString[7] },
    { id: 7, label: 'language', value: cpeString[8] },
    { id: 8, label: 'SW edition', value: cpeString[9] },
    { id: 9, label: 'target software', value: cpeString[10] },
    { id: 10, label: 'Hardware', value: cpeString[11] },
    { id: 11, label: 'other', value: cpeString[12] }
  ]

  return (
    <LynkModal
      maxW='500px'
      isOpen={isOpen}
      onClose={onClose}
      title={'CPE Details'}
      Icon={LuInfo}
      noFooter
    >
      <Stack spacing={1}>
        <Flex gap={2} mb={1} alignItems={'center'}>
          <Input
            isReadOnly
            fontSize={'sm'}
            defaultValue={value}
            _focus={{ boxShadow: 'none' }}
          />
          <CopyButton
            onCopy={() => cpe.onCopy()}
            hasCopied={cpe?.hasCopied}
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
              <InfoTag>{item?.value}</InfoTag>
            </Flex>
          ))}
        </Stack>
      </Stack>
    </LynkModal>
  )
}

export default CpeCard
