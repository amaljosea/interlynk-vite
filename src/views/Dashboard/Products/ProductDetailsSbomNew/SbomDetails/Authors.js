import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Flex, Stack, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/react'

import ActiveBtn from 'components/Misc/ActiveBtn'

import { useThemeColor } from 'hooks/useThemeColors'

import { authorDelete } from 'graphQL/Mutation'

import AuthorModal from '../../components/AuthorModal'
import ConfirmationModal from '../../components/ConfirmationModal'

const authorInfo = (item) => {
  return (
    <Stack dir='column' spacing={1}>
      <Text>Name: {item?.name || 'N/A'}</Text>
      {item?.email && <Text>Email: {item?.email}</Text>}
      {item?.phone && <Text>Phone: {item?.phone}</Text>}
    </Stack>
  )
}

const Authors = ({ data, permission }) => {
  const params = useParams()
  const AUTHOR = useDisclosure()
  const DELETE_AUTHOR = useDisclosure()

  const [deleteAuthor, { loading }] = useMutation(authorDelete)

  const { primaryBlueText, sameSecondaryText } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText'
  ])

  const [activeTool, setActiveTool] = useState(null)

  const handleWarning = (item) => {
    setActiveTool(item)
    DELETE_AUTHOR?.onOpen()
  }

  const handleRemove = async (id) => {
    await deleteAuthor({
      variables: { authorId: id, sbomId: params?.sbomid }
    }).then((res) => res?.data && DELETE_AUTHOR?.onClose())
  }

  return (
    <>
      <Flex alignItems={'center'} flexWrap={'wrap'} gap={2}>
        {data?.map((item, index) => (
          <Tooltip key={index} label={authorInfo(item)}>
            <Tag
              variant='subtle'
              colorScheme='blue'
              sx={{ w: 'fit-content', h: 7 }}
            >
              <TagLabel>
                {item?.name} {item?.email && `- ${item?.email}`}
              </TagLabel>
              <TagCloseButton
                hidden={permission}
                onClick={() => handleWarning(item)}
              />
            </Tag>
          </Tooltip>
        ))}
        <ActiveBtn
          label={'add_author'}
          onClick={AUTHOR?.onOpen}
          title={data?.length > 0 ? 'Add New' : 'Add Author'}
          color={data?.length > 0 ? sameSecondaryText : primaryBlueText}
        />
      </Flex>

      {/* AUTHOR MODAL */}
      {AUTHOR?.isOpen && (
        <AuthorModal
          isOpen={AUTHOR?.isOpen}
          onClose={AUTHOR?.onClose}
          ruleExists
        />
      )}

      {/* AUTHOR DELETE MODAL */}
      {DELETE_AUTHOR?.isOpen && (
        <ConfirmationModal
          isLoading={loading}
          title={'Remove Author'}
          isOpen={DELETE_AUTHOR?.isOpen}
          onClose={DELETE_AUTHOR?.onClose}
          onConfirm={() => handleRemove(activeTool?.id)}
          name={`${activeTool?.name}${activeTool?.email ? ` - ${activeTool.email}` : ''}`}
          description={`You are about to delete the Author : ${activeTool?.name}-${activeTool?.email} from this version.`}
        />
      )}
    </>
  )
}

export default Authors
