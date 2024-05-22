import { useState } from 'react'

import { DeleteIcon } from '@chakra-ui/icons'

import { ConfirmationModal } from 'components/Modal/ConfirmationModal'

import { getInternalComponents } from 'graphQL/Queries'

const { useMutation } = require('@apollo/client')
const { IconButton, Text, Button, useToast } = require('@chakra-ui/react')
const { deleteOrgComp } = require('graphQL/Mutation')

export const DeleteInternalComponent = ({ internalComponent }) => {
  const { id } = internalComponent
  const [isConfirming, setIsConfirming] = useState(false)
  const toast = useToast()

  const onCancel = () => {
    setIsConfirming(false)
  }

  const [deleteComp, { loading: deleting }] = useMutation(deleteOrgComp, {
    refetchQueries: [getInternalComponents],
    onCompleted: () => {
      toast({
        description: `Internal component delete successful!`,
        status: 'success',
        position: 'top',
        duration: 3000
      })
      onCancel()
    }
  })
  return (
    <>
      {isConfirming && (
        <ConfirmationModal
          onClose={onCancel}
          onConfirm={() => {
            deleteComp({
              variables: {
                id
              }
            })
          }}
          confirmText='Delete'
          header='Delete internal component?'
          footer={
            <>
              <Button mr={3} onClick={onCancel}>
                Cancel
              </Button>
              <Button
                isLoading={deleting}
                colorScheme={'red'}
                onClick={() => {
                  deleteComp({
                    variables: {
                      id
                    }
                  })
                }}
              >
                Delete
              </Button>
            </>
          }
        >
          <Text>
            Are you sure want to delete internal component with regular
            expression "{internalComponent.matchStr}"
          </Text>
        </ConfirmationModal>
      )}
      <IconButton
        icon={<DeleteIcon />}
        colorScheme='red'
        size='sm'
        isLoading={deleting}
        onClick={() => {
          setIsConfirming(true)
        }}
      >
        Delete
      </IconButton>
    </>
  )
}
