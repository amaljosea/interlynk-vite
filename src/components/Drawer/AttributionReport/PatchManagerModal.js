import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { truncatedValue } from 'utils'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'

import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react'

import ConfirmDeleteButton from 'components/ConfirmDeleteButton'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'
import LynkFormLabel from 'components/Misc/LynkLabel'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { PatchCreate, PatchDelete, PatchUpdate } from 'graphQL/Mutation'

import { LuBandage } from 'react-icons/lu'

const PATCH_KIND_OPTIONS = [
  { value: 'UN_OFFICIAL', label: 'Unofficial' },
  { value: 'MONKEY', label: 'Monkey' },
  { value: 'BACK_PORT', label: 'Back Port' },
  { value: 'CHERRY_PICK', label: 'Cherry Pick' }
]

const PatchFormFields = ({
  patch,
  onChange,
  errors,
  disabled,
  validateUrlBlur
}) => {
  return (
    <>
      <FormControl isRequired>
        <FormLabel htmlFor='patch-content'>Content</FormLabel>
        <Textarea
          placeholder='Enter patch content here'
          value={patch.content}
          onChange={(e) => onChange('content', e.target.value)}
          minH='120px'
          maxH='400px'
          resize='vertical'
          isDisabled={disabled}
        />
      </FormControl>
      <FormControl isInvalid={!!errors.url}>
        <FormLabel htmlFor='patch-url'>URL</FormLabel>
        <Input
          placeholder='Enter URL for the patch (optional)'
          value={patch.url}
          onChange={(e) => onChange('url', e.target.value)}
          onBlur={validateUrlBlur}
          isDisabled={disabled}
        />
        {!!errors.url && <FormErrorMessage>{errors.url}</FormErrorMessage>}
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Kind' />
        <LynkSelect
          placeholder='-- SELECT --'
          value={
            PATCH_KIND_OPTIONS.find((opt) => opt.value === patch.kind) || null
          }
          onChange={(selected) => onChange('kind', selected?.value || '')}
          options={PATCH_KIND_OPTIONS}
          isDisabled={disabled}
          dropDown
        />
      </FormControl>
    </>
  )
}

const PatchFormActions = ({
  primaryText,
  onPrimary,
  onCancel,
  isPrimaryLoading,
  isPrimaryDisabled,
  isCancelDisabled
}) => {
  const isAddPatch = primaryText === '+ Add Patch'
  return (
    <HStack mt={2} spacing={2} align='start'>
      <Button
        colorScheme={'blue'}
        variant={'solid'}
        onClick={onPrimary}
        isDisabled={isPrimaryDisabled}
        isLoading={isPrimaryLoading}
        minW={isAddPatch ? 'full' : '60px'}
        minH={isAddPatch && '48PX'}
      >
        {primaryText}
      </Button>
      {onCancel && (
        <Button onClick={onCancel} isDisabled={isCancelDisabled} minW='60px'>
          Cancel
        </Button>
      )}
    </HStack>
  )
}

const resetEditingPatch = (setEditingPatch) => {
  setEditingPatch({ id: null, content: '', url: '', kind: 'UN_OFFICIAL' })
}

const resetNewPatch = (setNewPatch) => {
  setNewPatch({ content: '', url: '', kind: 'UN_OFFICIAL' })
}

const PatchManagerModal = ({ isOpen, onClose, rowData }) => {
  const { showToast } = useCustomToast()

  const [patchUrlErrors, setPatchUrlErrors] = useState({ new: '', edit: '' })
  const [expandedPatchIds, setExpandedPatchIds] = useState(new Set())
  const [patches, setPatches] = useState(rowData?.components?.patches || [])
  const [newPatch, setNewPatch] = useState({
    content: '',
    url: '',
    kind: 'UN_OFFICIAL'
  })
  const [editingPatch, setEditingPatch] = useState({
    id: null,
    content: '',
    url: '',
    kind: 'UN_OFFICIAL'
  })

  const [createPatch, { loading: patchLoading }] = useMutation(PatchCreate)
  const [updatePatch, { loading: updatePatchLoading }] =
    useMutation(PatchUpdate)
  const [deletePatch, { loading: deletePatchLoading }] =
    useMutation(PatchDelete)

  const { primaryBlueText, secondaryTextInverse } = useThemeColor([
    'primaryBlueText',
    'secondaryTextInverse'
  ])

  useEffect(() => {
    setPatches(rowData?.components?.patches || [])
  }, [rowData])

  const handleNewPatchChange = (field, value) => {
    setNewPatch((prev) => ({ ...prev, [field]: value }))
    if (field === 'url') {
      setPatchUrlErrors((prev) => ({ ...prev, new: '' }))
    }
  }

  const validatePatchUrl = (url, field) => {
    if (url) {
      if (hasWhiteSpace(url)) {
        setPatchUrlErrors((prev) => ({
          ...prev,
          [field]: 'URL should not contain white spaces'
        }))
        return false
      }
      if (!validateUrl(url)) {
        setPatchUrlErrors((prev) => ({
          ...prev,
          [field]: 'Please enter a valid URL'
        }))
        return false
      }
    }
    setPatchUrlErrors((prev) => ({ ...prev, [field]: '' }))
    return true
  }

  const handleAddPatch = async () => {
    if (!newPatch.content && !newPatch.url) return
    if (!validatePatchUrl(newPatch.url, 'new')) return

    try {
      const response = await createPatch({
        variables: {
          input: {
            patchInput: {
              componentId: rowData?.components?.id,
              content: newPatch.content || '',
              url: newPatch.url || '',
              kind: newPatch.kind
            }
          }
        }
      })

      const { patch, errors } = response.data.patchCreate

      if (errors?.length > 0) {
        showToast({
          description: 'Failed to create patch, please try again',
          status: 'error'
        })
        return
      }

      if (patch) {
        setPatches((prev) => [...prev, patch])
        resetNewPatch(setNewPatch)
        showToast({
          description: 'Patch created successfully',
          status: 'success'
        })
      }
    } catch (error) {
      showToast({
        description:
          error.message || 'Failed to create patch, please try again',
        status: 'error'
      })
    }
  }

  const handleEditPatch = (patch) => {
    setEditingPatch({
      id: patch.id,
      content: patch.content || '',
      url: patch.url || '',
      kind: patch.kind || 'UN_OFFICIAL'
    })
  }

  const handleSavePatch = async (patch) => {
    if (!validatePatchUrl(editingPatch.url, 'edit')) return
    try {
      const response = await updatePatch({
        variables: {
          input: {
            id: patch.id,
            patchInput: {
              componentId: rowData?.components?.[0]?.id || rowData?.id,
              content: editingPatch.content || '',
              url: editingPatch.url || '',
              kind: editingPatch.kind
            }
          }
        }
      })
      const { patch: updatedPatch, errors } = response.data.patchUpdate
      if (errors?.length > 0) {
        showToast({
          description: 'Failed to update patch, please try again',
          status: 'error'
        })
        return
      }
      setPatches((prev) =>
        prev.map((p) => (p.id === patch.id ? { ...p, ...updatedPatch } : p))
      )
      resetEditingPatch(setEditingPatch)
      showToast({
        description: 'Patch updated successfully',
        status: 'success'
      })
    } catch (error) {
      showToast({
        description: 'Failed to update patch, please try again',
        status: 'error'
      })
    }
  }

  const handleDeletePatch = async (patch) => {
    try {
      await deletePatch({
        variables: {
          input: { id: patch.id }
        }
      })
      setPatches((prev) => prev.filter((p) => p.id !== patch.id))

      showToast({
        description: 'Patch deleted successfully',
        status: 'success'
      })
    } catch (error) {
      showToast({
        description: 'Failed to delete patch, please try again',
        status: 'error'
      })
    }
  }

  const handleExpand = (id) => {
    setExpandedPatchIds((prev) => new Set(prev).add(id))
  }

  const handleCollapse = (id) => {
    setExpandedPatchIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleModalClose = () => {
    resetEditingPatch(setEditingPatch)
    resetNewPatch(setNewPatch)
    setPatchUrlErrors({ new: '', edit: '' })
    setExpandedPatchIds(new Set())
    onClose()
  }

  const onSubmit = () => {
    if (editingPatch.id) {
      const patch = patches.find((p) => p.id === editingPatch.id)
      if (patch) handleSavePatch(patch)
    } else if (newPatch.content || newPatch.url) {
      handleAddPatch()
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={'Manage Patches'}
      Icon={LuBandage}
      noFooter
      maxW={'700px'}
      onSubmit={onSubmit}
    >
      <Box>
        <Text mb={4}>
          Patches for{' '}
          <span style={{ fontStyle: 'italic' }}>{rowData?.name}</span>
        </Text>
        <VStack align='stretch' spacing={2} mt={6}>
          {editingPatch.id && (
            <LynkAlert
              msg='You are currently editing a patch. Please save or cancel your changes before adding a new patch.'
              status='info'
            />
          )}
          <Text fontWeight={'medium'} color={secondaryTextInverse}>
            Add New Patch
          </Text>
          <Box display='flex' flexDirection='column' gap={2} mb={4}>
            <PatchFormFields
              patch={newPatch}
              onChange={handleNewPatchChange}
              errors={{ url: patchUrlErrors.new }}
              disabled={editingPatch.id}
              validateUrlBlur={() => validatePatchUrl(newPatch.url, 'new')}
            />
            <PatchFormActions
              primaryText='+ Add Patch'
              onPrimary={handleAddPatch}
              isPrimaryLoading={patchLoading}
              isPrimaryDisabled={!newPatch.content || editingPatch.id}
            />
          </Box>
          <Text fontWeight={'medium'} color={secondaryTextInverse}>
            Patch Records
          </Text>
          {patches?.length > 0 ? (
            <>
              {patches.map((patch) => (
                <Box key={patch.id} p={4} borderRadius='md'>
                  <Flex align='flex-start' justify='space-between' mb={4}>
                    <Box flex='1'>
                      {editingPatch.id === patch.id ? (
                        <Box
                          display='flex'
                          flexDirection='column'
                          gap={2}
                          mb={2}
                        >
                          <PatchFormFields
                            patch={editingPatch}
                            onChange={(field, value) =>
                              setEditingPatch((prev) => ({
                                ...prev,
                                [field]: value
                              }))
                            }
                            errors={{ url: patchUrlErrors.edit }}
                            disabled={updatePatchLoading}
                            validateUrlBlur={() =>
                              validatePatchUrl(editingPatch.url, 'edit')
                            }
                          />
                          <PatchFormActions
                            primaryText='Save'
                            onPrimary={() => handleSavePatch(patch)}
                            onCancel={() => {
                              setPatchUrlErrors((prev) => ({
                                ...prev,
                                edit: ''
                              }))
                              resetEditingPatch(setEditingPatch)
                            }}
                            isPrimaryLoading={updatePatchLoading}
                            isPrimaryDisabled={updatePatchLoading}
                            isCancelDisabled={updatePatchLoading}
                          />
                        </Box>
                      ) : (
                        <>
                          <Text fontSize='sm' fontWeight='semibold' mt={0.5}>
                            Content:
                          </Text>
                          <Text
                            fontSize='sm'
                            whiteSpace='pre-line'
                            wordBreak='break-word'
                          >
                            {expandedPatchIds?.has(patch.id) ? (
                              <>
                                {patch.content}{' '}
                                <Button
                                  variant='link'
                                  size='xs'
                                  onClick={() => handleCollapse(patch.id)}
                                  color={primaryBlueText}
                                >
                                  read less...
                                </Button>
                              </>
                            ) : patch.content.length > 300 ? (
                              <>
                                {truncatedValue(patch.content, 200)}{' '}
                                <Button
                                  variant='link'
                                  size='xs'
                                  onClick={() => handleExpand(patch.id)}
                                  color={primaryBlueText}
                                >
                                  read more...
                                </Button>
                              </>
                            ) : (
                              patch.content || 'N/A'
                            )}
                          </Text>
                          <Box mt={3} mb={1}>
                            <Text fontSize='sm' fontWeight='semibold'>
                              URL:
                            </Text>
                            <Text fontSize='sm' wordBreak='break-all'>
                              {patch.url ? (
                                <a
                                  href={
                                    patch.url.startsWith('http://') ||
                                    patch.url.startsWith('https://')
                                      ? patch.url
                                      : `https://${patch.url}`
                                  }
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  style={{
                                    color: primaryBlueText,
                                    fontWeight: 'normal'
                                  }}
                                >
                                  {patch.url}
                                </a>
                              ) : (
                                <span style={{ fontWeight: 'normal' }}>
                                  N/A
                                </span>
                              )}
                            </Text>
                          </Box>
                          <Box mt={2}>
                            <Text fontSize='sm' fontWeight='semibold'>
                              Kind:
                            </Text>
                            <Text fontSize='sm' fontWeight='normal'>
                              {PATCH_KIND_OPTIONS.find(
                                (opt) => opt.value === patch.kind
                              )?.label || patch.kind}
                            </Text>
                          </Box>
                        </>
                      )}
                    </Box>
                    <Box hidden={editingPatch?.id} ml='auto' pl={2}>
                      <HStack spacing={1} align='start'>
                        <ConfirmDeleteButton
                          itemId={patch.id}
                          handleDelete={() => handleDeletePatch(patch)}
                          loading={deletePatchLoading}
                          deleteBtnProps={{ size: 'md', variant: 'solid' }}
                          buttonSize='md'
                          editBtnProps={{
                            onClick: () => handleEditPatch(patch),
                            isDisabled: updatePatchLoading,
                            ariaLabel: 'Edit Patch',
                            size: 'md'
                          }}
                        />
                      </HStack>
                    </Box>
                  </Flex>
                  <Divider />
                </Box>
              ))}
            </>
          ) : (
            <Text>No patches added yet.</Text>
          )}
        </VStack>
      </Box>
    </LynkModal>
  )
}

export default PatchManagerModal
