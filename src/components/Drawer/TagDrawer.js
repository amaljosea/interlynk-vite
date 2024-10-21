import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex
} from '@chakra-ui/react'

import LabelCreator from 'components/Label/LabelCreator'
import LabelList from 'components/Label/LabelList'

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
    createTag({ variables: { name, color } }).then((res) => {
      const { errors } = res?.data?.labelCreate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      }
    })
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
    updateTag({
      variables: { id, name, color }
    }).then((res) => {
      const { errors } = res?.data?.labelUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      }
    })
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
    <>
      <Drawer
        size='md'
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth='1px'>Manage Tags</DrawerHeader>
          <DrawerBody as={Flex} sx={{ mt: 2, gap: 4, flexDirection: 'column' }}>
            <LabelCreator onAddLabel={addLabel} />
            <Divider />
            <LabelList
              labels={labels}
              loading={loading}
              onDeleteLabel={deleteLabel}
              onEditLabel={editLabel}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default TagDrawer
