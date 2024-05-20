import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { updatedValue } from 'utils'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tag,
  useToast
} from '@chakra-ui/react'

import { CreatePolicyRule, UpdatePolicyRule } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'

const RuleModal = ({ activeRow, data, isOpen, onClose, refetch }) => {
  const toast = useToast()

  const [operator, setOperator] = useState('')
  const [subject, setSubject] = useState('')
  const [value, setValue] = useState('')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(0)
  const [error, setError] = useState('')

  const { data: subOperators } = useQuery(PolicySubjectOperators, {
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
    refetch()
  }

  const isInvalid =
    operator === '' || subject === '' || value === '' || error !== ''

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
    onCreateRule({
      variables: {
        policyId: activeRow?.id,
        operator: operator === '' ? undefined : operator,
        subject: subject === '' ? undefined : subject,
        value: value === '' ? undefined : value
      }
    }).then((res) => {
      const errors = res?.data?.policyRuleCreate?.errors
      if (errors?.length > 0) {
        console.log(errors[0])
        setError(errors[0])
      } else {
        toast({
          description: 'Rule added successfully',
          status: 'success',
          position: 'top',
          duration: 2000
        })
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
    onUpdateRule({
      variables: {
        id: data?.id,
        policyId: data?.policyId,
        operator: operator === '' ? undefined : operator,
        subject: subject === '' ? undefined : subject,
        value:
          value === ''
            ? undefined
            : operator === 'RANGE' && value !== ''
              ? JSON.stringify(value)
              : value
      }
    }).then((res) => {
      const errors = res?.data?.policyRuleUpdate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        toast({
          description: 'Rule updated successfully',
          status: 'success',
          position: 'top',
          duration: 2000
        })
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
      console.log('data', data)
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
              <Tag colorScheme='blue' mb={4} wordBreak={'break-all'} p={2}>
                {activeRow?.name}
              </Tag>
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
                  <Select
                    fontSize={'sm'}
                    value={subject}
                    onChange={onSubjectChange}
                    placeholder='-- Select --'
                    textTransform={'capitalize'}
                  >
                    {subOperators?.policySubjectOperatorMapping?.map(
                      (rule, index) => (
                        <option
                          key={index}
                          value={rule.subject}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {rule.category} {rule?.name}
                        </option>
                      )
                    )}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Operator</FormLabel>
                  <Select
                    id='operator'
                    name='operator'
                    value={operator}
                    onChange={onOperatorChange}
                    textTransform={'capitalize'}
                    fontSize='sm'
                  >
                    <option value=''>-- Select --</option>
                    {filterOperators?.operators?.map((item, index) => (
                      <option
                        key={index}
                        value={item}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {updatedValue(item)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {subject === 'VULNERABILITY_SEV' && (
                  <FormControl isRequired>
                    <FormLabel>Value</FormLabel>
                    <Select
                      id='operator'
                      name='operator'
                      value={value}
                      onChange={onValueChange}
                      textTransform={'capitalize'}
                      fontSize='sm'
                    >
                      <option value=''>-- Select --</option>
                      {['Critical', 'High', 'Medium', 'Low'].map(
                        (item, index) => (
                          <option
                            key={index}
                            value={item}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </Select>
                  </FormControl>
                )}
                {operator === 'RANGE' && (
                  <Grid templateColumns={`repeat(2,1fr)`} gap={4}>
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel>Min</FormLabel>
                        <Input
                          type='text'
                          name='min'
                          value={min}
                          fontSize='sm'
                          onChange={(e) => setMin(e.target.value)}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel>Max</FormLabel>
                        <Input
                          type='text'
                          name='max'
                          value={max}
                          fontSize='sm'
                          onChange={(e) => setMax(e.target.value)}
                          onKeyDown={() => setValue(`{min:${min},max:${max}}`)}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                )}
                {subject !== 'VULNERABILITY_SEV' && operator !== 'RANGE' && (
                  <FormControl isRequired>
                    <FormLabel>Value</FormLabel>
                    <Input
                      type='text'
                      name='value'
                      value={value}
                      fontSize='sm'
                      onChange={onValueChange}
                    />
                  </FormControl>
                )}
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='blue' type='submit' disabled={isInvalid}>
                {data ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default RuleModal
