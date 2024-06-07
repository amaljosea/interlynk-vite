import { useMutation } from '@apollo/client'
import { useState } from 'react'

import { DeleteIcon } from '@chakra-ui/icons'
import { Button, IconButton, Text, useToast } from '@chakra-ui/react'

import { ConfirmationModal } from 'components/Modal/ConfirmationModal'

import { deleteOrgComp } from 'graphQL/Mutation'
import { getInternalComponents } from 'graphQL/Queries'

export const DeleteInternalComponent = ({ internalComponent }) => {
  const { id } = internalComponent
  const [isConfirming, setIsConfirming] = useState(false)
  const toast = useToast()

  const onCancel = () => setIsConfirming(false)

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
          header='UnTag internal component?'
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
                UnTag
              </Button>
            </>
          }
        >
          <Text>
            Components tagged <span style={{ fontWeight: 600 }}>internal</span>{' '}
            with regular expression{' '}
            <span style={{ fontWeight: 600 }}>
              {internalComponent.matchStr}
            </span>
            , will be untagged. Do you want to proceed ?
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
        UnTag
      </IconButton>
    </>
  )
}
