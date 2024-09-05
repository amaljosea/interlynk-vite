import { useMutation } from '@apollo/client'
import { useState } from 'react'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import {
  Checkbox,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal
} from '@chakra-ui/react'

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
      {isConfirming && (
        <ConfirmationModal
          isOpen={isConfirming}
          onClose={onCancel}
          onConfirm={handleDelete}
          isLoading={deleting}
          name={matchStr}
          title={'Delete Regular Expression'}
          description={`Do you wish to delete regular expression: ${matchStr} that is being used to find ${' '} Internal Components ?`}
        >
          <Checkbox mt={3} isChecked={untag} onChange={() => setUntag(!untag)}>
            Also remove the internal flag from previously tagged components.
          </Checkbox>
        </ConfirmationModal>
      )}
    </>
  )
}
