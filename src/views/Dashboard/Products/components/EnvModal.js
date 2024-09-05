import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { errorMapping } from 'utils/errorUtils'

import { PlusSquareIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Flex,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { EnvCreate } from 'graphQL/Mutation'

const EnvModal = ({ groupId, isOpen, onClose }) => {
  const { showToast } = useCustomToast()
  const [projectCreate] = useMutation(EnvCreate)
  const [productName, setProductName] = useState('')
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    await projectCreate({
      variables: {
        groupId,
        name: productName,
        enabled: true
      }
    }).then((res) => {
      const errors = res?.data?.projectCreate?.errors
      if (errors?.length > 0) {
        setError(errorMapping[errors[0]] || errors[0])
      } else {
        showToast({
          description: 'Environment added successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  const isInvalid = productName === '' || error !== ''

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'Add Environment'}
      buttonText={'Save'}
      disabled={isInvalid}
      onSubmit={handleSave}
      Icon={PlusSquareIcon}
    >
      <Flex width={'100%'} direction={'column'} gap={4}>
        {error !== '' && (
          <Alert status='error' borderRadius={4}>
            <AlertIcon />
            <AlertDescription fontSize={'sm'} pr={2}>
              {error}
            </AlertDescription>
          </Alert>
        )}
        <FormControl isRequired>
          <FormLabel fontSize={12}>Name</FormLabel>
          <Input
            type='text'
            value={productName || ''}
            onChange={(e) => {
              setProductName(e.target.value)
              setError('')
            }}
          />
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default EnvModal
