import React, { useState } from 'react'

import { Button, Flex, Tooltip } from '@chakra-ui/react'

import DeleteButton from './Icons/DeleteButton'
import EditButton from './Icons/EditButton'

const ConfirmDeleteButton = ({
  itemId,
  handleDelete,
  loading,
  editBtnProps,
  deleteBtnProps,
  buttonSize = 'md',
  customDeleteFunction,
  customDeleteVariable
}) => {
  const [warning, setWarning] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const isConfirming = warning === itemId

  const handleDeleteFunction = async (itemId) => {
    setDeletingId(itemId)
    try {
      await handleDelete(itemId)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCustomDelete = async (itemId) => {
    setDeletingId(itemId)
    try {
      await customDeleteFunction(customDeleteVariable)
    } finally {
      setDeletingId(null)
    }
  }

  return isConfirming ? (
    <Flex gap={2} alignItems='center'>
      <Tooltip label={'Cancel Delete'}>
        <Button
          size={buttonSize}
          fontSize={14}
          onClick={() => setWarning('')}
          // leftIcon={<Icon as={MdDeleteOutline} w={5} h={5} />}
          px={2}
          iconSpacing='4px'
          isLoading={deletingId === itemId && loading}
        >
          No
        </Button>
      </Tooltip>
      <Tooltip label={'Delete'}>
        <Button
          size={buttonSize}
          fontSize={14}
          colorScheme='red'
          onClick={() => {
            if (customDeleteFunction) {
              handleCustomDelete()
              setWarning('')
              return
            }
            handleDeleteFunction(itemId)
            setWarning('')
          }}
          // leftIcon={<Icon as={MdDeleteOutline} w={5} h={5} />}
          px={2}
          iconSpacing='4px'
          data-testid='confirm_delete'
          isLoading={deletingId === itemId && loading}
        >
          Yes
        </Button>
      </Tooltip>
    </Flex>
  ) : (
    <Flex gap={2} alignItems='center'>
      {editBtnProps && (
        <EditButton
          hidden={deletingId === itemId && loading}
          size={buttonSize}
          {...editBtnProps}
        />
      )}
      <DeleteButton
        isLoading={deletingId === itemId && loading}
        variant='solid'
        onClick={() => setWarning(itemId)}
        size={buttonSize}
        {...deleteBtnProps}
      />
    </Flex>
  )
}

export default ConfirmDeleteButton
