import { useMutation } from '@apollo/client'
import { useState } from 'react'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import { Checkbox, Menu, MenuItem, MenuList, Portal } from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { deleteOrgComp } from 'graphQL/Mutation'

export const DeleteInternalComponent = ({
  internalComponent,
  manageListing
}) => {
  const { id, matchStr } = internalComponent
  const [isConfirming, setIsConfirming] = useState(false)
  const [untag, setUntag] = useState(false)
  const { showToast } = useCustomToast()

  const { primaryErrorColor } = useThemeColor(['secondaryTextColor'])

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
        <LynkAction data-testid='tag-actions' />
        <Portal>
          <MenuList fontSize={'sm'}>
            <MenuItem
              color={primaryErrorColor}
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
