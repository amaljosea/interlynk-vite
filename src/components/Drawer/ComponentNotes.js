import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'

import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { Divider, IconButton, Textarea } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Flex, Stack, Text } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkAlert from 'components/LynkAlert'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

const GetNotes = gql`
  query GetNotes($id: Uuid!, $sbomId: Uuid!) {
    component(id: $id, sbomId: $sbomId) {
      annotations {
        id
        annotatableId
        annotatableType
        comment
      }
    }
  }
`

const CreateNote = gql`
  mutation CreateNote(
    $annotatableId: Uuid!
    $annotatableType: AnnotatableEnum!
    $comment: String!
  ) {
    annotationCreate(
      input: {
        annotatableId: $annotatableId
        annotatableType: $annotatableType
        comment: $comment
      }
    ) {
      annotation {
        id
        annotatableType
        comment
      }
      errors
    }
  }
`

const UpdateNote = gql`
  mutation UpdateNote(
    $id: Uuid!
    $annotatableId: Uuid
    $annotatableType: AnnotatableEnum
    $comment: String
  ) {
    annotationUpdate(
      input: {
        id: $id
        annotatableId: $annotatableId
        annotatableType: $annotatableType
        comment: $comment
      }
    ) {
      annotation {
        id
      }
      errors
    }
  }
`

const DeleteNote = gql`
  mutation DeleteNote($id: Uuid!) {
    annotationDelete(input: { id: $id }) {
      annotation {
        id
      }
      errors
    }
  }
`

const ComponentNotes = ({ data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  const { id, sbomId } = data || {}

  const noteForm = useRef(null)
  const [edit, setEdit] = useState(false)
  const [error, setError] = useState('')
  const [noteId, setNoteId] = useState('')
  const [comment, setComment] = useState('')

  const [createNote, { loading: createLoading }] = useMutation(CreateNote)
  const [updateNote, { loading: updateLoading }] = useMutation(UpdateNote)
  const [deleteNote] = useMutation(DeleteNote)

  const { data: notes, loading: noteLoading } = useQuery(GetNotes, {
    variables: { id, sbomId }
  })
  const { annotations } = notes?.component || {}

  const handleCreateNote = async () => {
    await createNote({
      variables: {
        comment,
        annotatableId: id,
        annotatableType: 'COMPONENT'
      }
    })
      .then((res) => {
        if (res?.data?.annotationCreate?.errors?.length > 0) {
          setError(res?.data?.annotationCreate?.errors[0])
        } else {
          showToast({ description: 'Note created', status: 'success' })
        }
      })
      .finally(() => {
        setComment('')
        setEdit(false)
      })
  }

  const handleUpdateNote = async () => {
    await updateNote({
      variables: {
        comment,
        id: noteId,
        annotatableType: 'COMPONENT'
      }
    })
      .then((res) => {
        if (res?.data?.annotationUpdate?.errors?.length > 0) {
          setError(res?.data?.annotationUpdate?.errors[0])
        } else {
          showToast({ description: 'Note updated', status: 'success' })
        }
      })
      .finally(() => {
        setComment('')
        setEdit(false)
      })
  }

  const handleDeleteNote = async (id) => {
    await deleteNote({ variables: { id } }).then((res) => {
      if (res?.data?.annotationDelete?.errors?.length > 0) {
        showToast({
          description: res?.data?.annotationDelete?.errors[0],
          status: 'error'
        })
      } else {
        setEdit(false)
      }
    })
  }

  const handleSubmit = async () => {
    if (noteId) {
      await handleUpdateNote()
    } else {
      await handleCreateNote()
    }
  }

  const scrollToSection = () => {
    noteForm?.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (edit && noteId) scrollToSection()
  }, [edit, noteId])

  return (
    <Drawer size='md' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={3} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text mb={1} fontWeight={'medium'}>
            Notes
          </Text>
          {data && <CompInfo data={data} />}
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing={4}>
            {edit ? (
              <Stack spacing={4} ref={noteForm}>
                {/* NOTE COMMENT */}
                <FormControl>
                  <FormLabel>Comment</FormLabel>
                  <Textarea
                    fontSize={'sm'}
                    value={comment}
                    maxLength={512}
                    placeholder={'Add some comment'}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </FormControl>
                {error !== '' && <LynkAlert msg={error} />}
                {/* NOTE ACTIONS */}
                <ButtonGroup>
                  <Button
                    w={'24'}
                    fontSize={'sm'}
                    variant='outline'
                    colorScheme='blue'
                    onClick={() => setEdit(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    w={'24'}
                    fontSize={'sm'}
                    variant='solid'
                    colorScheme='blue'
                    isDisabled={comment === ''}
                    onClick={handleSubmit}
                    isLoading={createLoading || updateLoading}
                  >
                    Save
                  </Button>
                </ButtonGroup>
              </Stack>
            ) : (
              <Button
                mt={2}
                w={'full'}
                fontSize={'sm'}
                leftIcon={<AddIcon />}
                onClick={() => {
                  setNoteId('')
                  setComment('')
                  setEdit(true)
                }}
              >
                Add Note
              </Button>
            )}
            <Divider />
            {noteLoading ? (
              <CustomLoader />
            ) : (
              <Stack>
                {annotations?.length > 0 ? (
                  <Stack spacing={6} mb={4}>
                    {annotations?.map((note, index) => (
                      <Flex
                        gap={8}
                        key={index}
                        alignItems={'flex-start'}
                        justify='space-between'
                      >
                        <Flex gap={2} alignItems={'flex-start'}>
                          <Text fontSize={'sm'}>{index + 1}.</Text>
                          <Text fontSize={'sm'}>{note.comment}</Text>
                        </Flex>
                        <Flex gap={2} alignItems={'center'}>
                          <IconButton
                            size='sm'
                            cursor='pointer'
                            icon={<EditIcon />}
                            onClick={() => {
                              setEdit(true)
                              setNoteId(note?.id)
                              setComment(note.comment)
                            }}
                          />
                          <IconButton
                            size='sm'
                            cursor='pointer'
                            icon={<DeleteIcon />}
                            onClick={() => handleDeleteNote(note.id)}
                          />
                        </Flex>
                      </Flex>
                    ))}
                  </Stack>
                ) : (
                  <Text textAlign={'center'} color={sameSecondaryText}>
                    No record to display
                  </Text>
                )}
              </Stack>
            )}
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ComponentNotes
