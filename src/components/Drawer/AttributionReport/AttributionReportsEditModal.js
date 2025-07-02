import { useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { transformLicenseString } from 'utils'

import { Box, FormControl, Text, Textarea } from '@chakra-ui/react'
import { Flex, Input, useClipboard } from '@chakra-ui/react'

import CopyButton from 'components/Icons/CopyButton'
import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'
import LynkFormLabel from 'components/Misc/LynkLabel'

import useCustomToast from 'hooks/useCustomToast'

import { UpdateComponent } from 'graphQL/Mutation'

import { LuCopyright, LuFileText, LuScale } from 'react-icons/lu'

import PatchManagerModal from './PatchManagerModal'

const AttributionReportsEditModal = ({
  isOpen,
  onClose,
  rowData,
  setSelectedRowData,
  sourcePreferences
}) => {
  const [updateComponent, { loading }] = useMutation(UpdateComponent)

  const { showToast } = useCustomToast()
  const { tabData } = useContext(TabContext)

  const [copyrightValue, setCopyrightValue] = useState('')
  const [noticeValue, setNoticeValue] = useState('')
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
      default:
        return prefix
    }
  }

  const onSubmit = () => {
    switch (editingField) {
      case 'license':
        return handleUpdateLicense()
      case 'copyright':
        return handleUpdateCopyright()
      case 'notice':
        return handleUpdateNotice()
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

  const licenseValue = isEditable
    ? rowData?.license
    : rowData?.enrichedContent?.licensesExp

  const licenseString = useClipboard(licenseValue || '')

  // If editingField is 'patches', render PatchManagerModal instead
  if (editingField === 'patches') {
    return (
      <PatchManagerModal isOpen={isOpen} onClose={onClose} rowData={rowData} />
    )
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      onSubmit={onSubmit}
      buttonText='Save'
      isLoading={loading}
      Icon={getIcon()}
      disabled={!isEditable}
      maxW={'700px'}
    >
      <Box>
        <Text mb={4}>
          {isEditable ? 'Editing ' : 'Viewing '}
          {editingField} for{' '}
          <span style={{ fontStyle: 'italic' }}>{rowData?.name}</span>
        </Text>
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
      </Box>
    </LynkModal>
  )
}

export default AttributionReportsEditModal
