import { useMutation, useQuery } from '@apollo/client'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Flex, FormControl, FormLabel, Input, Alert, AlertIcon, AlertDescription, Select, Grid, GridItem, IconButton, Text, Heading, useToast, InputLeftAddon, InputGroup } from '@chakra-ui/react'
import { DeletePolicyRule } from 'graphQL/Mutation'
import { UpdatePolicyRule } from 'graphQL/Mutation'
import { CreatePolicyRule } from 'graphQL/Mutation'
import { PolicyCreate, PolicyUpdate } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { useEffect, useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'
import { updatedValue } from 'utils'

const PolicyModal = ({ data, isOpen, onClose, refetch }) => {
  const { totalRows, policyState } = useGlobalState()
  const { searchInput } = policyState
  const toast = useToast()
  const [name, setName] = useState('')
  const [operator, setOperator] = useState('')
  const [resultType, setResultType] = useState('')
  const [error, setError] = useState('')
  const [conditions, setConditions] = useState([])
  const [deletedRules, setDeletedRules] = useState([])

  const { data: subOperators } = useQuery(PolicySubjectOperators, { fetchPolicy: 'network-only' })
  const [createPolicy] = useMutation(PolicyCreate)
  const [updatePolicy] = useMutation(PolicyUpdate)
  const [onCreateRule] = useMutation(CreatePolicyRule)
  const [onUpdateRule] = useMutation(UpdatePolicyRule)
  const [onDeleteRule] = useMutation(DeletePolicyRule)


  const handleRefetch = () => { refetch({ variables: { search: searchInput === '' ? undefined : searchInput, first: totalRows } }) }


  const lastRow = conditions[conditions?.length - 1];

  const isInvalid = name === '' || operator === '' || resultType === '' || error !== '' || (lastRow?.id === '' || lastRow?.subject === '' || lastRow?.value === '' || lastRow?.operator === '' || lastRow?.list === '' || lastRow?.status === '' || lastRow?.min === '' || lastRow?.max === '')

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
    if(conditions?.length > 0) {
      const lastRow = conditions[conditions.length - 1];
      console.log(lastRow);
      if (lastRow.id && lastRow.subject && lastRow.value && lastRow.operator && lastRow?.list && lastRow?.status && lastRow?.min && lastRow?.max) {
        setConditions([...conditions, { id: newId, subject: '', operator: '', value: '', list: [], status: 'CREATED', min: '0', max: '0' }]);
        setError('')
      } else {
        setError('Please fill all fields before adding a new one.')
      }
    } else {  
      setConditions([...conditions, { id: newId, subject: '', operator: '', value: '', list: [], status: 'CREATED', min:'0', max:'0' }]);
    }
  };

  const deleteRow = rule => {
    const newData = conditions?.filter(item => item.id !== rule?.id);
    setConditions(newData);
    if(rule?.status === 'ADDED') {
      setDeletedRules((prev) => [...prev, rule])
    }
  };

  const handleSubjectChange = (e, id, field) => {
    setError('')
    const newData = conditions.map(item => {
      if (item.id === id) {
        const result = subOperators?.policySubjectOperatorMapping?.find((item) => item?.subject === e.target.value)
        console.log('result', result)
        return { ...item, [field]: e.target.value, list: [...result?.operators] };
      }
      return item;
    });
    setConditions(newData);
  };

  const handleChange = (value, id, field) => {
    setError('')
    const newData = conditions.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setConditions(newData);
  };

  const handleBlur = (rule) => {
    const newData = conditions.map(item => {
      if (item.id === rule?.id) {
        return { ...item, value: `{min:${rule?.min},max:${rule?.max}}` };
      }
      return item;
    });
    setConditions(newData);
  }

  const createRule = (item, policyId) => {
    onCreateRule({ variables: { policyId: policyId, operator: item?.operator === '' ? undefined : item?.operator, subject: item?.subject === '' ? undefined : item?.subject, value: item?.operator === 'RANGE' ? JSON.stringify({min:item?.min,max: item?.max}) : item?.value === '' ? undefined : item?.value }
    }).then((res) => {
      const ruleErros = res?.data?.policyRuleCreate?.errors
      if (ruleErros?.length > 0) {
        console.log(ruleErros[0])
      } else {
        setError('')
        handleRefetch()
      }
    })
  }

  const updateRule = async (item, policyId) => {
     onUpdateRule({ variables: { id: item?.id, policyId: policyId, operator: item?.operator === '' ? undefined : item?.operator, subject: item?.subject === '' ? undefined : item?.subject, value: item?.operator === 'RANGE' ? JSON.stringify({min:item?.min,max: item?.max}) : item?.value === '' ? undefined : item?.value }
    }).then((res) => {
      const ruleErrors = res?.data?.policyRuleUpdate?.errors
      if (ruleErrors?.length > 0) {
        setError(ruleErrors[0])
      } else {
        setError('')
        handleRefetch()
      }
    })
  }

  const deleteRule = (id) => {
    onDeleteRule({ variables: { id: id } }).then((res) => {
      const ruleErros = res?.data?.policyRuleDelete?.errors
      if (ruleErros?.length > 0) {
        console.log(ruleErros[0])
      } else {
        setDeletedRules([])
        setError('')
        handleRefetch()
      }
    })
  }


  const handleCreate = async (e) => {
    e.preventDefault()
    await createPolicy({ variables: { name, isEnabled: true, operator: operator === '' ? undefined : operator, resultType: resultType === '' ? undefined : resultType }
    }).then((res) => {
      const errors = res?.data?.policyCreate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        if(conditions?.length > 0) {
          conditions?.map((item) => createRule(item, res?.data?.policyCreate?.policy?.id))
        }
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
        const existingData = conditions?.filter((item) => item?.status === 'ADDED')
        const newData = conditions?.filter((item) => item?.status === 'CREATED')
        if(existingData?.length > 0) {
          existingData?.map((item) => updateRule(item, res?.data?.policyUpdate?.policy?.id))
        }
        if (newData?.length > 0) {
          newData?.map((item) =>  createRule(item, res?.data?.policyUpdate?.policy?.id))
        }
        if(deletedRules?.length > 0) {
          deletedRules?.map((item) =>  deleteRule(item?.id))
        }
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
    if (data && subOperators) {
      console.log(data);
      setName(data?.name || '')
      setOperator(data?.operator === 'any' ? 'ANY' : data?.operator === 'all' ? 'ALL' : '')
      setResultType(data?.resultType  === 'warn' ? 'WARN' : data?.resultType === 'inform' ? 'INFORM' : 'FAIL')
      const rules = []
      const opList = (item) => subOperators?.policySubjectOperatorMapping?.find((op) => op?.subject === item?.subject)
      data?.policyRules?.map((item) => rules?.push({id:item?.id, subject: item?.subject, operator: item?.operator, value: item?.value, list: opList(item)?.operators, status: 'ADDED', min: item?.operator === 'RANGE' ? JSON.parse(item?.value)?.min : '0', max: item?.operator === 'RANGE' ? JSON.parse(item?.value)?.max : '0'}))
      setConditions(rules)
    }
  }, [data, subOperators])

  return (
    <>
      <Modal size='5xl' isOpen={isOpen} onClose={onClose}>
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
                  <IconButton colorScheme='blue' icon={<FaPlus />} onClick={addRow}/>
                </Flex>
                {conditions?.length > 0 && conditions?.map((item, index) => (
                  <Grid key={index} templateColumns='repeat(12, 1fr)' gap={4}>
                    <GridItem colSpan={3}>
                      <Select value={item?.subject} onChange={e => handleSubjectChange(e, item.id, 'subject')} placeholder="-- Select Subject --" textTransform={'capitalize'} fontSize='sm'>
                        {subOperators?.policySubjectOperatorMapping?.map((rule, index) => (
                          <option key={index} value={rule.subject} style={{textTransform:'capitalize'}}>{rule.category} {rule?.name}</option>
                        ))}
                      </Select>
                    </GridItem>
                    <GridItem colSpan={3}>
                      <Select id='operator' name='operator' value={item?.operator} onChange={e => handleChange(e.target.value, item.id, 'operator')} textTransform={'capitalize'} fontSize='sm' placeholder='-- Select Opeator --'>
                      {item?.list?.map(option => (
                        <option value={option} key={option}>{updatedValue(option)}</option>
                      ))}
                      </Select>
                    </GridItem>
                    {item?.subject === 'VULNERABILITY_SEV' && (
                    <GridItem colSpan={5}>
                      <FormControl isRequired>
                        <Select id='operator' name='operator' value={item?.value} onChange={(e) => handleChange(e.target.value, item.id, 'value')} textTransform={'capitalize'} fontSize='sm' disabled={item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'}>
                          <option value=''>-- Select --</option>
                          {['Critical','High','Medium','Low'].map((item, index) => (
                            <option key={index} value={item} style={{ textTransform: 'capitalize' }} >
                              {item}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>
                    )}
                    {((item?.subject === 'VULNERABILITY_EPSS' || item?.subject === 'COMPONENT_VERSION') && item?.operator === 'RANGE') && (
                    <GridItem colSpan={5}>
                      <Flex alignItems={'center'} gap={4}>
                      <InputGroup>
                        <InputLeftAddon>Min</InputLeftAddon>
                        <Input type='text' name='min' value={item?.min} fontSize='sm' onChange={(e) => handleChange(e.target.value, item.id, 'min')} onBlur={() => handleBlur(item)} />
                      </InputGroup>
                      <InputGroup>
                        <InputLeftAddon>Max</InputLeftAddon>
                        <Input type='text' name='max' value={item?.max} fontSize='sm' onChange={(e) => handleChange(e.target.value, item.id, 'max')} onBlur={() => handleBlur(item)}/>
                      </InputGroup>
                      </Flex>
                    </GridItem>
                    )}
                    {item?.operator !== 'RANGE' && item?.subject !== 'VULNERABILITY_SEV' && (
                      <GridItem colSpan={5}>
                        <Input placeholder='Value' value={item?.value} onChange={e => handleChange(e.target.value, item.id, 'value')} />
                      </GridItem>
                    )}
                    <GridItem colSpan={1}>
                      <Flex gap={3} justifyContent={'flex-end'}>
                        <IconButton colorScheme='red' icon={<FaTrash />} onClick={() => deleteRow(item)}/>
                      </Flex>
                    </GridItem>
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
