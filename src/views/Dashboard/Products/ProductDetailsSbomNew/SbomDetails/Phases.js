import { Flex, Tag, TagLabel, useDisclosure } from '@chakra-ui/react'

import ActiveBtn from 'components/Misc/ActiveBtn'

import { useThemeColor } from 'hooks/useThemeColors'

import PhaseModal from '../../components/PhaseModal'

const Phases = ({ data, permission }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { primaryBlueText, sameSecondaryText } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText'
  ])

  const phaseExists = data?.length > 0

  return (
    <>
      <Flex alignItems={'center'} flexWrap={'wrap'} gap={2}>
        {phaseExists &&
          data?.map((item, index) => (
            <Tag
              key={index}
              variant='subtle'
              colorScheme='cyan'
              sx={{ w: 'fit-content', h: 7 }}
            >
              <TagLabel textTransform='capitalize'>{item}</TagLabel>
            </Tag>
          ))}
        <ActiveBtn
          onClick={onOpen}
          hidden={permission}
          label={'add_phase'}
          editable={phaseExists ? true : false}
          title={phaseExists ? 'Update' : 'Add Phase'}
          color={phaseExists ? sameSecondaryText : primaryBlueText}
        />
      </Flex>

      {isOpen && <PhaseModal data={data} isOpen={isOpen} onClose={onClose} />}
    </>
  )
}

export default Phases
