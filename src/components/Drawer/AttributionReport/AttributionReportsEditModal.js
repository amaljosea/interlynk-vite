import { useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { transformLicenseString, truncatedValue } from 'utils'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'

import {
  Box,
  Button,
  Select as ChakraSelect,
  Flex,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
  useClipboard
} from '@chakra-ui/react'

import CopyButton from 'components/Icons/CopyButton'
import DeleteButton from 'components/Icons/DeleteButton'
import EditButton from 'components/Icons/EditButton'
import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'
import LynkFormLabel from 'components/Misc/LynkLabel'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  PatchCreate,
  PatchDelete,
  PatchUpdate,
  UpdateComponent
} from 'graphQL/Mutation'

import { LuBandage, LuCopyright, LuFileText, LuScale } from 'react-icons/lu'

const PATCH_KIND_OPTIONS = [
  { value: 'UN_OFFICIAL', label: 'Unofficial' },
  { value: 'MONKEY', label: 'Monkey' },
  { value: 'BACK_PORT', label: 'Back Port' },
  { value: 'CHERRY_PICK', label: 'Cherry Pick' }
]

const AttributionReportsEditModal = ({
  isOpen,
  onClose,
  rowData,
  setSelectedRowData,
  sourcePreferences
}) => {
  const [updateComponent, { loading }] = useMutation(UpdateComponent)
  const [createPatch, { loading: patchLoading }] = useMutation(PatchCreate)
  const [updatePatch, { loading: updatePatchLoading }] =
    useMutation(PatchUpdate)
  const [deletePatch, { loading: deletePatchLoading }] =
    useMutation(PatchDelete)
  const { showToast } = useCustomToast()
  const { tabData } = useContext(TabContext)
  const { secondaryBgColor, primaryBlueText } = useThemeColor([
    'secondaryBgColor',
    'primaryBlueText'
  ])

  const [copyrightValue, setCopyrightValue] = useState('')
  const [noticeValue, setNoticeValue] = useState('')
  const [patches, setPatches] = useState(
    rowData?.components?.[0]?.patches || []
  )
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
  const [confirmDeletePatchId, setConfirmDeletePatchId] = useState(null)
  const [patchUrlErrors, setPatchUrlErrors] = useState({ new: '', edit: '' })
  const [expandedPatchId, setExpandedPatchId] = useState(null)

  const editingField = rowData?.field

  const isEditable =
    sourcePreferences[rowData.id] === 'sbom' ||
    sourcePreferences[rowData.id] === undefined

  useEffect(() => {
    const source = isEditable ? rowData : rowData?.enrichedContent

    if (editingField === 'copyright') {
      setCopyrightValue(
        isEditable ? source?.copyright || '' : source?.copyright || 'N/A'
      )
    } else if (editingField === 'notice') {
      setNoticeValue(
        isEditable ? source?.notice || '' : source?.notice || 'N/A'
      )
    } else if (editingField === 'patches') {
      setPatches(rowData?.components?.patches || [])
    }
  }, [editingField, rowData, isEditable])

  const getModalTitle = () => {
    const prefix = isEditable ? 'Edit' : 'View'
    switch (editingField) {
      case 'license':
        return `${prefix} License`
      case 'copyright':
        return `${prefix} Copyright`
      case 'notice':
        return `${prefix} Notice`
      case 'patches':
        return `Manage Patches`
      default:
        return prefix
    }
  }

  const onSumbit = () => {
    switch (editingField) {
      case 'license':
        return handleUpdateLicense
      case 'copyright':
        return handleUpdateCopyright
      case 'notice':
        return handleUpdateNotice
      case 'patches':
        return () => {
          if (editingPatch.id) {
            const patch = patches.find((p) => p.id === editingPatch.id)
            if (patch) handleSavePatch(patch)
          } else {
            handleAddPatch()
          }
        }
      default:
        return null
    }
  }

  const getIcon = () => {
    switch (editingField) {
      case 'license':
        return LuScale
      case 'copyright':
        return LuCopyright
      case 'notice':
        return LuFileText
      case 'patches':
        return LuBandage
      default:
        return LuScale
    }
  }

  const handleUpdate = async (field, value, updateKey) => {
    const variables = {
      id: rowData?.id,
      sbomId: rowData?.sbomId,
      [updateKey]: value || ''
    }

    try {
      const res = await updateComponent({ variables })
      const { errors } = res?.data?.componentUpdate || {}

      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        showToast({
          description: `${field} updated successfully for ${rowData?.name}`,
          status: 'success'
        })

        setSelectedRowData((prevSelectedRows) =>
          prevSelectedRows.map((selectedRow) =>
            selectedRow.id === rowData?.id
              ? { ...selectedRow, [updateKey]: value }
              : selectedRow
          )
        )

        onClose()
      }
    } catch (error) {
      showToast({ description: 'Something went wrong', status: 'error' })
    }
  }

  const handleUpdateLicense = () => {
    const hasLicense = tabData.details?.licenses?.length > 0
    const isCustomLicense =
      hasLicense && tabData.details.licenses[0].type === 'Custom License'

    const license = isCustomLicense
      ? transformLicenseString(tabData.details.licenses[0].value)
      : tabData.details?.licenses?.[0]?.value || ''

    handleUpdate('License', { licensesExp: license }, 'licenses')
  }

  const handleUpdateCopyright = () => {
    handleUpdate('Copyright', copyrightValue, 'copyright')
  }
  const handleUpdateNotice = () => {
    handleUpdate('Notice', noticeValue, 'notice')
  }

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
              content: newPatch.content,
              url: newPatch.url || null,
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
        setNewPatch({ content: '', url: '', kind: 'UN_OFFICIAL' })
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
              content: editingPatch.content,
              url: editingPatch.url,
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
      setEditingPatch({ id: null, content: '', url: '', kind: 'UN_OFFICIAL' })
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
      setConfirmDeletePatchId(null)
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

  const onModalClose = () => {
    setNewPatch({
      content: '',
      url: '',
      kind: 'UN_OFFICIAL'
    })
    setPatchUrlErrors({ new: '', edit: '' })
    setEditingPatch({ id: null, content: '', url: '', kind: 'UN_OFFICIAL' })
    setConfirmDeletePatchId(null)
    onClose()
  }

  const licenseValue = isEditable
    ? rowData?.license
    : rowData?.enrichedContent?.licensesExp

  const licenseString = useClipboard(licenseValue || '')

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onModalClose}
      title={getModalTitle()}
      onSubmit={onSumbit()}
      buttonText='Save'
      isLoading={loading}
      Icon={getIcon()}
      disabled={!isEditable}
      maxW={'700px'}
      noFooter={rowData?.field === 'patches'}
    >
      <Box>
        {editingField === 'patches' ? (
          <Text mb={4}>
            Patches for{' '}
            <span style={{ fontStyle: 'italic' }}>{rowData?.name}</span>
          </Text>
        ) : (
          <Text mb={4}>
            {isEditable ? 'Editing ' : 'Viewing '}
            {editingField} for{' '}
            <span style={{ fontStyle: 'italic' }}>{rowData?.name}</span>
          </Text>
        )}
        {editingField === 'license' && (
          <>
            <LynkFormLabel label='Current value' />

            <Flex gap={2}>
              <Textarea
                isReadOnly
                fontSize={'sm'}
                defaultValue={licenseValue}
                disabled
              />
              <CopyButton
                onCopy={() => licenseString.onCopy()}
                hasCopied={licenseString?.hasCopied}
                size='md'
              />
            </Flex>
            <Box mt={4}>
              {isEditable && (
                <LicenseField
                  label='Change license to'
                  sbomView={false}
                  disabled={!isEditable}
                />
              )}
            </Box>
          </>
        )}
        {(editingField === 'copyright' || editingField === 'notice') && (
          <FormControl>
            <LynkFormLabel
              label={editingField === 'copyright' ? 'Copyright' : 'Notice'}
              htmlFor={editingField === 'copyright' ? 'copyright' : 'notice'}
            />
            <Textarea
              readOnly={!isEditable}
              name={editingField === 'copyright' ? 'copyright' : 'notice'}
              value={
                editingField === 'copyright' ? copyrightValue : noticeValue
              }
              placeholder={
                editingField === 'copyright' ? 'Add Copyright' : 'Add Notice'
              }
              onChange={(e) => {
                if (editingField === 'copyright') {
                  setCopyrightValue(e.target.value)
                } else {
                  setNoticeValue(e.target.value)
                }
              }}
            />
          </FormControl>
        )}
        {editingField === 'patches' && (
          <VStack align='stretch' spacing={2} mt={4}>
            <Text fontWeight='bold'>Add New Patch</Text>
            <Box display='flex' flexDirection='column' gap={2} mb={4}>
              <Box>
                <LynkFormLabel label='Content' htmlFor='patch-content' />
                <FormControl>
                  <Textarea
                    id='patch-content'
                    placeholder='Content'
                    value={newPatch.content}
                    onChange={(e) =>
                      handleNewPatchChange('content', e.target.value)
                    }
                    minH='120px'
                    maxH='300px'
                    resize='vertical'
                  />
                </FormControl>
              </Box>
              <Box>
                <LynkFormLabel label='URL' htmlFor='patch-url' />
                <FormControl isInvalid={!!patchUrlErrors.new}>
                  <Input
                    id='patch-url'
                    placeholder='URL'
                    value={newPatch.url}
                    onChange={(e) =>
                      handleNewPatchChange('url', e.target.value)
                    }
                    onBlur={() => validatePatchUrl(newPatch.url, 'new')}
                  />
                  {!!patchUrlErrors.new && (
                    <FormErrorMessage>{patchUrlErrors.new}</FormErrorMessage>
                  )}
                </FormControl>
              </Box>
              <Box>
                <LynkFormLabel label='Kind' htmlFor='patch-kind' />
                <ChakraSelect
                  id='patch-kind'
                  value={newPatch.kind}
                  onChange={(e) => handleNewPatchChange('kind', e.target.value)}
                  minW='120px'
                  width='200px'
                >
                  {PATCH_KIND_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </ChakraSelect>
              </Box>
              <Button
                mt={2}
                colorScheme='blue'
                onClick={handleAddPatch}
                isDisabled={!newPatch.content && !newPatch.url}
                isLoading={patchLoading}
                alignSelf='flex-start'
              >
                Add Patch
              </Button>
            </Box>
            <Text fontWeight='bold'>Existing Patches</Text>
            {patches?.length > 0 ? (
              <>
                {patches.map((patch) => (
                  <Box
                    key={patch.id}
                    mb={4}
                    p={3}
                    borderRadius='md'
                    bg={secondaryBgColor}
                  >
                    <Flex align='flex-start'>
                      {/* Content column */}
                      <Box flex='1'>
                        {editingPatch.id === patch.id ? (
                          <Box
                            display='flex'
                            flexDirection='column'
                            gap={2}
                            mb={2}
                          >
                            <Text fontSize='sm' fontWeight='semibold' mt={3}>
                              Content:
                            </Text>
                            <FormControl>
                              <Textarea
                                placeholder='Content'
                                value={editingPatch.content}
                                onChange={(e) =>
                                  setEditingPatch((prev) => ({
                                    ...prev,
                                    content: e.target.value
                                  }))
                                }
                                minH='120px'
                                maxH='300px'
                                resize='vertical'
                                isDisabled={updatePatchLoading}
                              />
                            </FormControl>
                            <Text fontSize='sm' fontWeight='semibold' mt={2}>
                              URL:
                            </Text>
                            <FormControl isInvalid={!!patchUrlErrors.edit}>
                              <Input
                                placeholder='URL'
                                value={editingPatch.url}
                                onChange={(e) => {
                                  setEditingPatch((prev) => ({
                                    ...prev,
                                    url: e.target.value
                                  }))
                                  setPatchUrlErrors((prev) => ({
                                    ...prev,
                                    edit: ''
                                  }))
                                }}
                                onBlur={() =>
                                  validatePatchUrl(editingPatch.url, 'edit')
                                }
                                isDisabled={updatePatchLoading}
                              />
                              {!!patchUrlErrors.edit && (
                                <FormErrorMessage>
                                  {patchUrlErrors.edit}
                                </FormErrorMessage>
                              )}
                            </FormControl>
                            <Text fontSize='sm' fontWeight='semibold' mt={2}>
                              Kind:
                            </Text>
                            <ChakraSelect
                              value={editingPatch.kind}
                              onChange={(e) =>
                                setEditingPatch((prev) => ({
                                  ...prev,
                                  kind: e.target.value
                                }))
                              }
                              isDisabled={updatePatchLoading}
                              minW='120px'
                              width='200px'
                            >
                              {PATCH_KIND_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </ChakraSelect>
                            <HStack mt={2} spacing={2} align='start'>
                              <Button
                                colorScheme='blue'
                                onClick={() => handleSavePatch(patch)}
                                isDisabled={updatePatchLoading}
                                isLoading={updatePatchLoading}
                                minW='60px'
                              >
                                Save
                              </Button>
                              <Button
                                onClick={() => {
                                  setPatchUrlErrors((prev) => ({
                                    ...prev,
                                    edit: ''
                                  }))
                                  setEditingPatch({
                                    id: null,
                                    content: '',
                                    url: '',
                                    kind: 'UN_OFFICIAL'
                                  })
                                }}
                                isDisabled={updatePatchLoading}
                                minW='60px'
                              >
                                Cancel
                              </Button>
                            </HStack>
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
                              {expandedPatchId === patch.id ? (
                                <>
                                  {patch.content}{' '}
                                  <Button
                                    variant='link'
                                    size='xs'
                                    onClick={() => setExpandedPatchId(null)}
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
                                    onClick={() => setExpandedPatchId(patch.id)}
                                    color={primaryBlueText}
                                  >
                                    read more...
                                  </Button>
                                </>
                              ) : (
                                patch.content || 'N/A'
                              )}
                            </Text>
                            <Text
                              mt={3}
                              mb={1}
                              fontSize='sm'
                              fontWeight='semibold'
                            >
                              URL:{' '}
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
                                <span
                                  style={{
                                    fontWeight: 'normal'
                                  }}
                                >
                                  N/A
                                </span>
                              )}
                            </Text>
                            <Text fontSize='sm' fontWeight='semibold' mt={2}>
                              Kind:{' '}
                              <span style={{ fontWeight: 'normal' }}>
                                {PATCH_KIND_OPTIONS.find(
                                  (opt) => opt.value === patch.kind
                                )?.label || patch.kind}
                              </span>
                            </Text>
                            <HStack mt={2} spacing={1} align='start'>
                              <EditButton
                                onClick={() => handleEditPatch(patch)}
                                isDisabled={updatePatchLoading}
                                aria-label='Edit Patch'
                                size='md'
                                type='primary'
                              />
                              <DeleteButton
                                onClick={() =>
                                  setConfirmDeletePatchId(patch.id)
                                }
                                isDisabled={deletePatchLoading}
                                aria-label='Delete Patch'
                                size='md'
                                variant='solid'
                              />
                              {confirmDeletePatchId === patch.id && (
                                <HStack spacing={1} ml={1} align='start'>
                                  <Button
                                    colorScheme='red'
                                    size='md'
                                    isLoading={deletePatchLoading}
                                    onClick={() => handleDeletePatch(patch)}
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    size='md'
                                    onClick={() =>
                                      setConfirmDeletePatchId(null)
                                    }
                                    isDisabled={deletePatchLoading}
                                  >
                                    No
                                  </Button>
                                </HStack>
                              )}
                            </HStack>
                          </>
                        )}
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </>
            ) : (
              <Text>No records</Text>
            )}
          </VStack>
        )}
      </Box>
    </LynkModal>
  )
}

export default AttributionReportsEditModal
