import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { errorMapping } from 'utils/errorUtils'

import { Flex, FormControl, FormLabel, Input } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { EnvCreate } from 'graphQL/Mutation'

import { LuSquarePen } from 'react-icons/lu'

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
      Icon={LuSquarePen}
    >
      <Flex width={'100%'} direction={'column'} gap={4}>
        {error !== '' && <LynkAlert msg={error} />}
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
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
