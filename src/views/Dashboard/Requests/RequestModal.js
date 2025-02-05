import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { Flex, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { RequestCreate } from 'graphQL/Mutation'

import { GoVersions } from 'react-icons/go'

const RequestModal = ({ isOpen, onClose }) => {
  const { showToast } = useCustomToast()

  const [email, setEmail] = useState('')
  const [productName, setProductName] = useState('')
  const [productVersion, setProductVersion] = useState('')
  const [notes, setNotes] = useState('')

  const [isSaveDisabled, setIsSaveDisabled] = useState(false)

  const [createRequest, { loading }] = useMutation(RequestCreate)

  useEffect(() => {
    if (email === '') {
      setIsSaveDisabled(true)
    } else {
      setIsSaveDisabled(false)
    }
  }, [email])

  const handleCreate = (e) => {
    e.preventDefault()
    setIsSaveDisabled(true)
    createRequest({
      variables: {
        email,
        productName,
        productVersion,
        notes
      }
    }).then((res) => {
      if (res?.data?.requestCreate?.errors?.length === 0) {
        showToast({
          description: 'SBOM request is being sent to the email',
          status: 'success'
        })
        onClose()
      } else {
        setIsSaveDisabled(false)
      }
    })
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleCreate}
      title={'Request SBOM'}
      Icon={GoVersions}
      isLoading={loading}
      disabled={isSaveDisabled}
      buttonText={'Save'}
    >
      <Flex width={'100%'} direction={'column'} gap={4}>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Product Name</FormLabel>
          <Input
            type='text'
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Product Version</FormLabel>
          <Input
            type='text'
            value={productVersion}
            onChange={(e) => setProductVersion(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea
            type='text'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default RequestModal
