import { useMutation, useQuery } from '@apollo/client'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Flex, FormControl, FormLabel, Input, Alert, AlertIcon, AlertDescription, Select, Tag, useToast } from '@chakra-ui/react'
import { UpdatePolicyRule, CreatePolicyRule } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { useEffect, useState } from 'react'

const RuleModal = ({ activeRow, data, isOpen, onClose, refetch }) => {
  const toast = useToast()
  const { totalRows, policyState } = useGlobalState()
  const { searchInput } = policyState

  const [operator, setOperator] = useState('')
  const [subject, setSubject] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const { data: subOperators } = useQuery(PolicySubjectOperators, {
    skip: subject === '' ? true : false,
    fetchPolicy: 'network-only'
  })

  const filterOperators =
    subOperators &&
    subOperators?.policySubjectOperatorMapping?.find(
      (item) => item?.subject === subject
    )

  const [onCreateRule] = useMutation(CreatePolicyRule)
  const [onUpdateRule] = useMutation(UpdatePolicyRule)

  const handleRefetch = () => {
    refetch({ variables: { search: searchInput === '' ? undefined : searchInput, first: totalRows } })
  }

  const isInvalid = operator === '' || subject === '' || value === '' || error !== ''

  const onValueChange = (e) => {
    setValue(e.target.value)
    setError('')
  }

  const onOperatorChange = (e) => {
    setOperator(e.target.value)
    setError('')
  }

  const onSubjectChange = (e) => {
    setSubject(e.target.value)
    setError('')
  }

  const handleCreate = (e) => {
    e.preventDefault()
    onCreateRule({ variables: { policyId: activeRow?.id, operator: operator === '' ? undefined : operator, subject: subject === '' ? undefined : subject, value: value === '' ? undefined : value }
    }).then((res) => {
      const errors = res?.data?.policyRuleCreate?.errors
      if (errors?.length > 0) {
        console.log(errors[0])
        setError(errors[0])
      } else {
        toast({description:'Rule added successfully', status:'success', position:'top', duration: 2000})
        setError('')
        handleRefetch()
        setValue('')
        setOperator('')
        setSubject('')
        onClose()
      }
    })
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    onUpdateRule({ variables: { id: data?.id, policyId: data?.policyId, operator: operator === '' ? undefined : operator, subject: subject === '' ? undefined : subject, value: value === '' ? undefined : (operator === 'RANGE' && value !== '') ? JSON.stringify(value) : value }
    }).then((res) => {
      const errors = res?.data?.policyRuleUpdate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        toast({description:'Rule updated successfully', status:'success', position:'top', duration: 2000})
        setError('')
        handleRefetch()
        setValue('')
        setOperator('')
        setSubject('')
        onClose()
      }
    })
  }

  useEffect(() => {
    if (data) {
      setValue(data?.value || '')
      setOperator(data?.operator || '')
      setSubject(data?.subject || '')
    }
  }, [data])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={data ? handleUpdate : handleCreate}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Create'} Policy Rule</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tag colorScheme='blue' mb={4} wordBreak={'break-all'} p={2}>{activeRow?.name}</Tag>
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
                  <FormLabel>Subject</FormLabel>
                  <Select id='subject' name='subject' value={subject} onChange={onSubjectChange} textTransform={'capitalize'} fontSize='sm'>
                    <option value=''>-- Select --</option>
                    {['VULNERABILITY_EPSS','VULNERABILITY_KEV','VULNERABILITY_CVE','VULNERABILITY_SEV','COMPONENT_PURL','COMPONENT_NAME','COMPONENT_VERSION','COMPONENT_CPE','LICENSE_SPDX_ID','LICENSE_CUSTOM'].map((item, index) => (
                      <option key={index} value={item} style={{ textTransform: 'capitalize' }} >
                        {item}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Operator</FormLabel>
                  <Select id='operator' name='operator' value={operator} onChange={onOperatorChange} textTransform={'capitalize'} fontSize='sm'>
                    <option value=''>-- Select --</option>
                    {filterOperators?.operators?.map((item, index) => (
                      <option key={index} value={item} style={{ textTransform: 'capitalize' }} >
                        {item}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Value</FormLabel>
                  <Input type='text' name='value' value={value} fontSize='sm' onChange={onValueChange} />
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

export default RuleModal
