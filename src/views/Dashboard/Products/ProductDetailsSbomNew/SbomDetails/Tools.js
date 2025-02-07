import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Flex, Stack, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/react'

import ActiveBtn from 'components/Misc/ActiveBtn'

import { useThemeColor } from 'hooks/useThemeColors'

import { toolDelete } from 'graphQL/Mutation'

import ConfirmationModal from '../../components/ConfirmationModal'
import ToolModal from '../../components/ToolModal'

const toolInfo = (item) => {
  return (
    <Stack dir='column' spacing={1}>
      <Text>Name: {item?.name}</Text>
      {item?.version && <Text>Version: {item?.version || 'N/A'}</Text>}
      {item?.vendor && <Text>Vendor: {item?.vendor || 'N/A'}</Text>}
    </Stack>
  )
}

const Tools = ({ data, permission }) => {
  const params = useParams()
  const TOOL = useDisclosure()
  const DELETE_TOOL = useDisclosure()

  const [deleteTool, { loading }] = useMutation(toolDelete)

  const { primaryBlueText, sameSecondaryText } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText'
  ])

  const [activeTool, setActiveTool] = useState(null)

  const handleWarning = (item) => {
    setActiveTool(item)
    DELETE_TOOL.onOpen()
  }

  const handleDelete = (id) => {
    deleteTool({ variables: { toolID: id, sbomID: params?.sbomid } }).then(
      (res) => res?.data && DELETE_TOOL?.onClose()
    )
  }

  return (
    <>
      <Flex alignItems={'center'} flexWrap={'wrap'} gap={2}>
        {data?.map((item, index) => (
          <Tooltip key={index} label={toolInfo(item)}>
            <Tag
              variant='subtle'
              colorScheme='teal'
              sx={{ w: 'fit-content', h: 7, cursor: 'pointer' }}
            >
              <TagLabel>
                {item?.name} - {item?.version}
              </TagLabel>
              <TagCloseButton
                hidden={permission}
                onClick={() => handleWarning(item)}
              />
            </Tag>
          </Tooltip>
        ))}
        <ActiveBtn
          label={'add_tool'}
          onClick={TOOL?.onOpen}
          title={data?.length > 0 ? 'Add New' : 'Add Tool'}
          color={data?.length > 0 ? sameSecondaryText : primaryBlueText}
        />
      </Flex>

      {/* TOOL MODAL */}
      {TOOL?.isOpen && (
        <ToolModal isOpen={TOOL?.isOpen} onClose={TOOL?.onClose} />
      )}

      {/* TOOL DELETE MODAL */}
      {DELETE_TOOL?.isOpen && (
        <ConfirmationModal
          isLoading={loading}
          title={'Remove Tool'}
          isOpen={DELETE_TOOL?.isOpen}
          onClose={DELETE_TOOL?.onClose}
          onConfirm={() => handleDelete(activeTool?.id)}
          name={`${activeTool?.name}-${activeTool?.version} `}
          description={`You are about to delete the creator Tool : ${activeTool?.name}-${activeTool?.version} from this version.`}
        />
      )}
    </>
  )
}

export default Tools
