import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { isValidHexCode } from 'utils'

import { Divider } from '@chakra-ui/react'

import LabelCreator from 'components/Label/LabelCreator'
import LabelList from 'components/Label/LabelList'
import LynkDrawer from 'components/LynkDrawer'

import useCustomToast from 'hooks/useCustomToast'

import { LabelCreate, LabelDelete, LabelUpdate } from 'graphQL/Mutation'
import { GetLabels } from 'graphQL/Queries'

const TagDrawer = ({ isOpen, onClose }) => {
  const { showToast } = useCustomToast()

  const [createTag] = useMutation(LabelCreate)
  const [updateTag] = useMutation(LabelUpdate)
  const [deleteTag] = useMutation(LabelDelete)

  const { data, loading } = useQuery(GetLabels, {
    skip: isOpen ? false : true,
    variables: { first: 500 }
  })

  const { nodes } = data?.labels || ''

  const [labels, setLabels] = useState([])

  const addLabel = (newLabel) => {
    const { name, color } = newLabel || ''
    const isValidColor = isValidHexCode(color)
    if (isValidColor) {
      createTag({ variables: { name, color } }).then((res) => {
        const { errors } = res?.data?.labelCreate || ''
        if (errors?.length > 0) {
          showToast({ description: errors[0], status: 'error' })
        } else {
          showToast({
            description: 'Label added successfully',
            status: 'success'
          })
        }
      })
    } else {
      showToast({
        description: 'Invalid color code',
        status: 'error'
      })
    }
  }

  const deleteLabel = (id) => {
    deleteTag({ variables: { id } }).then((res) => {
      const { errors } = res?.data?.labelDelete || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      }
    })
  }

  const editLabel = (editedLabel) => {
    const { id, name, color } = editedLabel || ''
    const isValidColor = isValidHexCode(color)
    if (isValidColor) {
      updateTag({
        variables: { id, name, color }
      }).then((res) => {
        const { errors } = res?.data?.labelUpdate || ''
        if (errors?.length > 0) {
          showToast({ description: errors[0], status: 'error' })
        }
      })
    } else {
      showToast({
        description: 'Invalid color code',
        status: 'error'
      })
    }
  }

  useEffect(() => {
    if (nodes?.length > 0) {
      let result = []
      nodes?.map((item) => {
        const { id, name, color, createdAt } = item || ''
        result?.push({ id, name, color, createdAt })
      })
      setLabels(result)
    } else {
      setLabels([])
    }
  }, [nodes])

  return (
    <LynkDrawer
      title={'Manage Tags'}
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      <LabelCreator onAddLabel={addLabel} />
      <Divider />
      <LabelList
        labels={labels}
        loading={loading}
        onDeleteLabel={deleteLabel}
        onEditLabel={editLabel}
      />
    </LynkDrawer>
  )
}

export default TagDrawer
