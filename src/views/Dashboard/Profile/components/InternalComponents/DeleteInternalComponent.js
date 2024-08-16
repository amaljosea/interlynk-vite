import { useMutation } from '@apollo/client'
import { useState } from 'react'

import {
  Button,
  Checkbox,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text
} from '@chakra-ui/react'

import { ConfirmationModal } from 'components/Modal/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { deleteOrgComp } from 'graphQL/Mutation'
import { getInternalComponents } from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'

export const DeleteInternalComponent = ({
  internalComponent,
  manageListing
}) => {
  const { id, matchStr } = internalComponent
  const [isConfirming, setIsConfirming] = useState(false)
  const [untag, setUntag] = useState(false)
  const { showToast } = useCustomToast()

  const onCancel = () => setIsConfirming(false)

  const [deleteComp, { loading: deleting }] = useMutation(deleteOrgComp, {
    onCompleted: () => {
      showToast({
        description: `Internal component delete successful!`,
        status: 'success'
      })
      onCancel()
    }
  })

  const handleDelete = () => {
    deleteComp({
      variables: {
        id,
        untag
      }
    })
  }

  return (
    <>
      {isConfirming && (
        <ConfirmationModal
          onClose={onCancel}
          onConfirm={handleDelete}
          confirmText='Delete'
          header='Delete Regular Expression'
          footer={
            <>
              <Button mr={3} onClick={onCancel}>
                Cancel
              </Button>
              <Button
                isLoading={deleting}
                colorScheme={'red'}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          }
        >
          <Text>
            Do you wish to delete regular expression:{' '}
            <strong>{matchStr}</strong> that is being used to find{' '}
            <strong>Internal Components</strong>?
          </Text>
          <Checkbox mt={3} isChecked={untag} onChange={() => setUntag(!untag)}>
            Also remove the internal flag from previously tagged components.
          </Checkbox>
        </ConfirmationModal>
      )}
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FaEllipsisV />}
          variant='none'
          color='gray.400'
        />
        <Portal>
          <MenuList fontSize={'sm'}>
            <MenuItem
              color='red'
              isDisabled={!manageListing}
              onClick={() => setIsConfirming(true)}
            >
              Delete
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </>
  )
}
