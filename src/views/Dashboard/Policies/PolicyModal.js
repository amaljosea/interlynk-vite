import { useMutation } from '@apollo/client'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Flex, FormControl, FormLabel, Input, Alert, AlertIcon, AlertDescription, Select } from '@chakra-ui/react'
import { PolicyCreate, PolicyUpdate } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import { useEffect, useState } from 'react'

const PolicyModal = ({ data, isOpen, onClose, refetch }) => {
  const { totalRows, policyState } = useGlobalState()
  const { searchInput } = policyState

  const [name, setName] = useState('')
  const [operator, setOperator] = useState('')
  const [resultType, setResultType] = useState('')
  const [error, setError] = useState('')

  const [createPolicy] = useMutation(PolicyCreate)
  const [updatePolicy] = useMutation(PolicyUpdate)

  const handleRefetch = () => { refetch({ variables: { search: searchInput === '' ? undefined : searchInput, first: totalRows } }) }

  const isInvalid = name === '' || operator === '' || resultType === '' || error !== ''

  const onNameChange = (e) => {
    setName(e.target.value)
    setError('')
  }

  const onOperatorChange = (e) => {
    setOperator(e.target.value)
    setError('')
  }

  const onResultChange = (e) => {
    setResultType(e.target.value)
    setError('')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await createPolicy({ variables: { name, isEnabled: true, operator: operator === '' ? undefined : operator, resultType: resultType === '' ? undefined : resultType }
    }).then((res) => {
      const errors = res?.data?.policyCreate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        setError('')
        handleRefetch()
        onClose()
      }
    })
    setName('')
    setOperator('')
    setResultType('')
    setError('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    await updatePolicy({ variables: { id: data?.id, name, isEnabled: data?.isEnabled, operator: operator === '' ? undefined : operator, resultType: resultType === '' ? undefined : resultType }
    }).then((res) => {
      const errors = res?.data?.policyUpdate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        setError('')
        handleRefetch()
        onClose()
      }
    })
    setName('')
    setOperator('')
    setResultType('')
    setError('')
  }

  useEffect(() => {
    if (data) {
      setName(data?.name || '')
      setOperator(data?.operator === 0 ? 'ANY' : data?.operator === 1 ? 'ALL' : '')
      setResultType(data?.resultType  === 'warn' ? 'WARN' : data?.resultType === 'inform' ? 'INFORM' : 'FAIL')
    }
  }, [data])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={data ? handleUpdate : handleCreate}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Create'} Policy</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
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
                  <FormLabel>Name</FormLabel>
                  <Input type='text' name='name' value={name} onChange={onNameChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Operator</FormLabel>
                  <Select id='operator' name='operator' value={operator} onChange={onOperatorChange} textTransform={'capitalize'} fontSize='sm'>
                    <option value=''>-- Select --</option>
                    {['ANY', 'ALL'].map((item, index) => (
                      <option key={index} value={item} style={{textTransform:'capitalize'}}>{item}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Result type</FormLabel>
                  <Select id='resultType' name='resultType' value={resultType} onChange={onResultChange} textTransform={'capitalize'} fontSize='sm'>
                    <option value=''>-- Select --</option>
                    {['INFORM', 'WARN','FAIL'].map((item, index) => (
                      <option key={index} value={item} style={{textTransform:'capitalize'}}>{item}</option>
                    ))}
                  </Select>
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme='blue' type='submit' disabled={isInvalid}>{data ? 'Update' : 'Save'}</Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default PolicyModal
