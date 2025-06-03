import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { isValidHexCode } from 'utils'

import { Divider } from '@chakra-ui/react'

import LabelCreator from 'components/Label/LabelCreator'
import LabelList from 'components/Label/LabelList'
import LynkDrawer from 'components/LynkDrawer'

import useCustomToast from 'hooks/useCustomToast'

import { LabelCreate, LabelDelete, LabelUpdate } from 'graphQL/Mutation'

const LabelsDrawer = ({ isOpen, onClose, data = [], loading }) => {
  const { showToast } = useCustomToast()
  const [createLabel] = useMutation(LabelCreate)
  const [updateLabel] = useMutation(LabelUpdate)
  const [deleteLabelMutation] = useMutation(LabelDelete)

  const [labels, setLabels] = useState([])

  const handleAddLabel = useCallback(
    async ({ name, color }) => {
      if (!isValidHexCode(color)) {
        return showToast({ description: 'Invalid color code', status: 'error' })
      }

      try {
        const { data } = await createLabel({ variables: { name, color } })
        const errors = data?.labelCreate?.errors
        if (errors?.length) {
          showToast({ description: errors[0], status: 'error' })
        } else {
          showToast({
            description: 'Label added successfully',
            status: 'success'
          })
        }
      } catch (err) {
        showToast({ description: 'Something went wrong', status: 'error' })
      }
    },
    [createLabel, showToast]
  )

  const handleDeleteLabel = useCallback(
    async (id) => {
      try {
        const { data } = await deleteLabelMutation({ variables: { id } })
        const errors = data?.labelDelete?.errors
        if (errors?.length) {
          showToast({ description: errors[0], status: 'error' })
        } else {
          showToast({
            description: 'Label deleted successfully',
            status: 'success'
          })
        }
      } catch (err) {
        showToast({ description: 'Something went wrong', status: 'error' })
      }
    },
    [deleteLabelMutation, showToast]
  )

  const handleEditLabel = useCallback(
    async ({ id, name, color }) => {
      if (!isValidHexCode(color)) {
        return showToast({ description: 'Invalid color code', status: 'error' })
      }

      try {
        const { data } = await updateLabel({ variables: { id, name, color } })
        const errors = data?.labelUpdate?.errors
        if (errors?.length) {
          showToast({ description: errors[0], status: 'error' })
        }
      } catch (err) {
        showToast({ description: 'Something went wrong', status: 'error' })
      }
    },
    [updateLabel, showToast]
  )

  useEffect(() => {
    if (data?.length) {
      const formatted = data.map(({ id, name, color, createdAt }) => ({
        id,
        name,
        color,
        createdAt
      }))
      setLabels(formatted)
    } else {
      setLabels([])
    }
  }, [data])

  return (
    <LynkDrawer
      title={'Manage Labels'}
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      <LabelCreator onAddLabel={handleAddLabel} />
      <Divider />
      <LabelList
        labels={labels}
        loading={loading}
        onDeleteLabel={handleDeleteLabel}
        onEditLabel={handleEditLabel}
      />
    </LynkDrawer>
  )
}

export default LabelsDrawer
