import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'
import { Button, FormControl, FormLabel, Input } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { orgUpdate } from 'graphQL/Mutation'

const OrgDrawer = ({ isOpen, onClose }) => {
  const [updateOrg, { loading: updateLoading }] = useMutation(orgUpdate)

  const { showToast } = useCustomToast()
  const { organization: orgData } = useGlobalState()
  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])

  const [orgName, setOrgName] = useState('')

  const handleUpdateOrgName = async () => {
    if (orgData?.name === orgName) {
      onClose()
      return
    }
    await updateOrg({
      variables: {
        name: orgName
      }
    }).then((res) => {
      if (res?.data?.organizationUpdate?.errors.length === 0) {
        showToast({
          description: 'Organization name updated successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  useEffect(() => {
    if (orgData) {
      setOrgName(orgData?.name)
    }
  }, [orgData])

  return (
    <Drawer
      size='md'
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={1} />
        <DrawerHeader fontWeight='500' borderBottomWidth='1px'>
          Edit Organization
        </DrawerHeader>

        <DrawerBody>
          <FormControl mb={4}>
            <FormLabel
              mb='8px'
              fontSize='16px'
              textColor={secondaryTextInverse}
            >
              Name
            </FormLabel>
            <Input
              value={orgName}
              placeholder='Enter organization name'
              onChange={(e) => setOrgName(e.target.value)}
            />
          </FormControl>

          <Button
            colorScheme='blue'
            isLoading={updateLoading}
            onClick={handleUpdateOrgName}
          >
            Update
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default OrgDrawer
