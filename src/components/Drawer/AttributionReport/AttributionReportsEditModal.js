import { useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { transformLicenseString } from 'utils'

import { Box, FormControl, Text, Textarea } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'
import LynkFormLabel from 'components/Misc/LynkLabel'

import useCustomToast from 'hooks/useCustomToast'

import { UpdateComponent } from 'graphQL/Mutation'

import { FaCopyright, FaFileLines, FaScaleBalanced } from 'react-icons/fa6'

const AttributionReportsEditModal = ({
  isOpen,
  onClose,
  rowData,
  sbomId,
  setSelectedRowData
}) => {
  const [updateComponent, { loading }] = useMutation(UpdateComponent)
  const { showToast } = useCustomToast()
  const { tabData } = useContext(TabContext)

  const [copyrightValue, setCopyrightValue] = useState('')
  const [noticeValue, setNoticeValue] = useState('')

  const editingField = rowData?.field

  useEffect(() => {
    if (editingField === 'copyright') {
      setCopyrightValue(rowData?.copyright || '')
    } else if (editingField === 'notice') {
      setNoticeValue(rowData?.notice || '')
    }
  }, [editingField, rowData])

  const getModalTitle = () => {
    switch (editingField) {
      case 'license':
        return 'Edit License'
      case 'copyright':
        return 'Edit Copyright'
      case 'notice':
        return 'Edit Notice'
      default:
        return 'Edit'
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
    }
  }

  const getIcon = () => {
    switch (editingField) {
      case 'license':
        return FaScaleBalanced
      case 'copyright':
        return FaCopyright
      case 'notice':
        return FaFileLines
    }
  }

  const handleUpdate = async (field, value, updateKey) => {
    const variables = {
      id: rowData?.id,
      sbomId,
      [updateKey]: value || undefined
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

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      onSubmit={onSumbit()}
      buttonText='Save'
      isLoading={loading}
      Icon={getIcon()}
    >
      <Box>
        <Text mb={4}>
          Editing {editingField} for{' '}
          <span style={{ fontStyle: 'italic' }}>{rowData?.name}</span>
        </Text>
        {editingField === 'license' && (
          <LicenseField sbomView={false} license={rowData?.license} />
        )}
        {(editingField === 'copyright' || editingField === 'notice') && (
          <FormControl>
            <LynkFormLabel
              label={editingField === 'copyright' ? 'Copyright' : 'Notice'}
              htmlFor={editingField === 'copyright' ? 'copyright' : 'notice'}
            />
            <Textarea
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
