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

import { FaCopyright, FaScaleBalanced } from 'react-icons/fa6'

const AttributionReportsEditModal = ({
  isOpen,
  onClose,
  editingField,
  rowData,
  sbomId
}) => {
  const [updateComponent, { loading }] = useMutation(UpdateComponent)
  const { showToast } = useCustomToast()
  const { tabData } = useContext(TabContext)

  const [copyrightValue, setCopyrightValue] = useState('')
  const [noticeValue, setNoticeValue] = useState('')

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
    }
  }

  const handleUpdateLicense = () => {
    const hasLicense = tabData.details?.licenses?.length > 0
    const isCustomLicense =
      hasLicense && tabData.details.licenses[0].type === 'Custom License'

    const license = isCustomLicense
      ? transformLicenseString(tabData.details.licenses[0].value)
      : tabData.details?.licenses?.[0]?.value || ''
    updateComponent({
      variables: {
        id: rowData?.id,
        sbomId,
        licenses: { licensesExp: license || '' }
      }
    }).then((res) => {
      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        showToast({
          description: `License updated successfully for ${rowData?.name}`,
          status: 'success'
        })
      }
      onClose()
    })
  }

  const handleUpdateCopyright = () => {
    updateComponent({
      variables: {
        id: rowData?.id,
        sbomId,
        copyright: copyrightValue || undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        showToast({
          description: `Copyright updated successfully for ${rowData?.name}`,
          status: 'success'
        })
      }
      onClose()
    })
  }
  const handleUpdateNotice = () => {
    updateComponent({
      variables: {
        id: rowData?.id,
        sbomId,
        notice: noticeValue || undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        showToast({
          description: `Notice updated successfully for ${rowData?.name}`,
          status: 'success'
        })
      }
      onClose()
    })
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
