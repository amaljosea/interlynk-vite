import { Flex, Tag, TagLabel, useDisclosure } from '@chakra-ui/react'

import ActiveBtn from 'components/Misc/ActiveBtn'

import { useThemeColor } from 'hooks/useThemeColors'

import LifecycleModal from '../../components/LifecycleModal'

const Lifecycle = ({ data, permission }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { primaryBlueText, sameSecondaryText } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText'
  ])

  return (
    <>
      <Flex alignItems={'center'} flexWrap={'wrap'} gap={2}>
        <Tag
          hidden={!data?.stage}
          variant='subtle'
          colorScheme='green'
          textTransform={'capitalize'}
          sx={{ w: 'fit-content', h: 7 }}
        >
          <TagLabel>
            {data?.stage ? String(data?.stage).replace(/_/g, ' ') : ''}
          </TagLabel>
        </Tag>
        <ActiveBtn
          onClick={onOpen}
          hidden={permission}
          label={'add_lifecycle'}
          editable={data?.stage ? true : false}
          title={data?.stage ? 'Update' : 'Add Lifecycle'}
          color={data?.stage ? sameSecondaryText : primaryBlueText}
        />
      </Flex>

      <LifecycleModal data={data} isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default Lifecycle
