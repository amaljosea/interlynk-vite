import { useMutation, useQuery } from '@apollo/client'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Flex, FormControl, FormLabel, Input, Alert, AlertIcon, AlertDescription, Select, Grid, GridItem, IconButton, Text, Heading, useToast } from '@chakra-ui/react'
import { UpdatePolicyRule } from 'graphQL/Mutation'
import { CreatePolicyRule } from 'graphQL/Mutation'
import { PolicyCreate, PolicyUpdate } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { useEffect, useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'

const PolicyModal = ({ data, isOpen, onClose, refetch }) => {
  const { totalRows, policyState } = useGlobalState()
  const { searchInput } = policyState
  const toast = useToast()
  const [name, setName] = useState('')
  const [operator, setOperator] = useState('')
  const [resultType, setResultType] = useState('')
  const [error, setError] = useState('')
  const [conditions, setConditions] = useState([])

  const { data: subOperators } = useQuery(PolicySubjectOperators, { fetchPolicy: 'network-only' })
  const [createPolicy] = useMutation(PolicyCreate)
  const [updatePolicy] = useMutation(PolicyUpdate)
  const [onCreateRule] = useMutation(CreatePolicyRule)
  const [onUpdateRule] = useMutation(UpdatePolicyRule)


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

  const addRow = () => {
    const newId = conditions?.length + 1;
    setConditions([...conditions, { id: newId, subject: '', operator: '', value: '' }]);
  };

  const deleteRow = id => {
    const newData = conditions?.filter(item => item.id !== id);
    setConditions(newData);
  };

  const handleChange = (e, id, field) => {
    const newData = conditions.map(item => {
      if (item.id === id) {
        return { ...item, [field]: e.target.value };
      }
      return item;
    });
    setConditions(newData);
  };


  const handleCreate = async (e) => {
    e.preventDefault()
    await createPolicy({ variables: { name, isEnabled: true, operator: operator === '' ? undefined : operator, resultType: resultType === '' ? undefined : resultType }
    }).then((res) => {
      const errors = res?.data?.policyCreate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        conditions?.length > 0 && conditions?.map((item) => {
          if(item?.subject !== '' && item?.operator !== '' && item?.value !== '') {
            onCreateRule({ variables: { policyId: res?.data?.policyCreate?.policy?.id, operator: item?.operator === '' ? undefined : item?.operator, subject: item?.subject === '' ? undefined : item?.subject, value: item?.value === '' ? undefined : item?.value }
            }).then((res) => {
              const ruleErros = res?.data?.policyRuleCreate?.errors
              if (ruleErros?.length > 0) {
                console.log(ruleErros[0])
              } else {
                toast({description:'Rule added successfully', status:'success', position:'top', duration: 2000})
              }
            })
          }
        })
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
      console.log('conditions',conditions);
      const errors = res?.data?.policyUpdate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        conditions?.length > 0 && conditions?.map((item) => {
          if(item?.subject !== '' && item?.operator !== '' && item?.value !== '') {
            onUpdateRule({ variables: { id: item?.id, policyId: res?.data?.policyUpdate?.policy?.id, operator: item?.operator === '' ? undefined : item?.operator, subject: item?.subject === '' ? undefined : item?.subject, value: item?.value === '' ? undefined : (item?.operator === 'RANGE' && item?.value !== '') ? JSON.stringify(item?.value) : item?.value }
            }).then((res) => {
              const ruleErrors = res?.data?.policyRuleUpdate?.errors
              if (ruleErrors?.length > 0) {
                setError(ruleErrors[0])
              } else {
                toast({description:'Rule updated successfully', status:'success', position:'top', duration: 2000})
              }
            })
          }
        })
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
    if (data && data?.policyRules?.length > 0) {
      setName(data?.name || '')
      setOperator(data?.operator === 0 ? 'ANY' : data?.operator === 1 ? 'ALL' : '')
      setResultType(data?.resultType  === 'warn' ? 'WARN' : data?.resultType === 'inform' ? 'INFORM' : 'FAIL')
      const rules = []
      data?.policyRules?.map((item) => rules?.push({id:item?.id, subject: item?.subject, operator: item?.operator, value: item?.value}))
      setConditions(rules)
    }
  }, [data])

  return (
    <>
      <Modal size='6xl' isOpen={isOpen} onClose={onClose}>
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
                <Grid templateColumns={'repeat(5,1fr)'} gap={4}>
                  <GridItem colSpan={3}>
                    <FormControl isRequired>
                      <FormLabel>Name</FormLabel>
                      <Input type='text' name='name' placeholder='Enter name' value={name} onChange={onNameChange} />
                    </FormControl>
                  </GridItem>
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel>Operator</FormLabel>
                      <Select id='operator' name='operator' value={operator} onChange={onOperatorChange} textTransform={'capitalize'} fontSize='sm'>
                        <option value=''>-- Select --</option>
                        {['ANY', 'ALL'].map((item, index) => (
                          <option key={index} value={item} style={{textTransform:'capitalize'}}>{item}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel>Result type</FormLabel>
                      <Select id='resultType' name='resultType' value={resultType} onChange={onResultChange} textTransform={'capitalize'} fontSize='sm'>
                        <option value=''>-- Select --</option>
                        {['INFORM', 'WARN','FAIL'].map((item, index) => (
                          <option key={index} value={item} style={{textTransform:'capitalize'}}>{item}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>
                <Flex width={'100%'} my={2} justifyContent={'space-between'} alignItems={'center'}>
                  <Heading fontWeight={'medium'} fontFamily={'inherit'} fontSize={'md'}>
                    Conditions
                  </Heading>
                  {!data &&<IconButton colorScheme='blue' icon={<FaPlus />} onClick={addRow}/>}
                </Flex>
                {conditions?.length > 0 && conditions?.map((item, index) => (
                  <Grid key={index} templateColumns='repeat(12, 1fr)' gap={4}>
                    <GridItem colSpan={3}>
                      <Select value={item?.subject} onChange={e => handleChange(e, item.id, 'subject')} placeholder="-- Select Subject --" textTransform={'capitalize'} fontSize='sm'>
                        {subOperators?.policySubjectOperatorMapping?.map((rule, index) => (
                          <option key={index} value={rule.subject} style={{textTransform:'capitalize'}}>{rule.category} {rule?.name}</option>
                        ))}
                      </Select>
                    </GridItem>
                    <GridItem colSpan={3}>
                      <Select id='operator' name='operator' value={item?.operator} onChange={e => handleChange(e, item.id, 'operator')} textTransform={'capitalize'} fontSize='sm' placeholder='-- Select Opeator --'>
                      {subOperators?.policySubjectOperatorMapping?.map(rule => (
                        <optgroup label={`${rule.category} ${rule?.name}`} key={rule.subject}>
                          {rule.operators.map(option => (
                            <option value={option} key={option}>{option}</option>
                          ))}
                        </optgroup>
                      ))}
                      </Select>
                    </GridItem>
                    <GridItem colSpan={5}>
                      <Input placeholder='Value' value={item?.value} onChange={e => handleChange(e, item.id, 'value')} />
                    </GridItem>
                    {!data && (
                      <GridItem colSpan={1}>
                        <Flex gap={3} justifyContent={'flex-end'}>
                          <IconButton colorScheme='red' icon={<FaTrash />} onClick={() => deleteRow(item?.id)}/>
                        </Flex>
                      </GridItem>
                    )}
                  </Grid>
                ))}
              </Flex>
            </ModalBody>
            <ModalFooter mt={6}>
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
