import { useMemo } from 'react'

import { Flex } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

const PartsSubHeader = (
  sbomParts,
  isArchived,
  onOpen,
  signedUrlParams,
  updateSboms
) => {
  const subHeader = useMemo(() => {
    const disabled = !updateSboms || signedUrlParams || sbomParts?.length === 5
    return (
      <Flex
        sx={{ w: '100%', gap: 2, alignItems: 'center' }}
        justifyContent={'flex-end'}
      >
        <AddButton
          label='Add Part'
          tooltipPlacement='top'
          onClick={onOpen}
          hidden={isArchived}
          aria-label='add_part'
          isDisabled={disabled}
        />
        <RefreshBtn />
      </Flex>
    )
  }, [isArchived, onOpen, sbomParts?.length, signedUrlParams, updateSboms])

  return subHeader
}

export default PartsSubHeader
