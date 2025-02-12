import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { updatedValue } from 'utils'
import { severityList } from 'variables/general'

import { EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Select,
  Tag,
  createIcon
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { CreatePolicyRule, UpdatePolicyRule } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'

const RuleModal = ({ activeRow, data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()

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
        setError(errors[0])
      } else {
        showToast({
          description: 'Rule added successfully',
          status: 'success'
        })
        setError('')
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
        showToast({
          description: 'Rule updated successfully',
          status: 'success'
        })
        setError('')
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
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${data ? 'Edit' : 'Create'} Policy Rule`}
      buttonText={data ? 'Update' : 'Save'}
      disabled={isInvalid}
      onSubmit={data ? handleUpdate : handleCreate}
      Icon={data ? EditIcon : createIcon}
    >
      <Tag colorScheme='blue' mb={4} wordBreak={'break-all'}>
        {activeRow?.name}
      </Tag>
      <Flex width={'100%'} direction={'column'} gap={4}>
        {error !== '' && <LynkAlert msg={error} />}
        <FormControl isRequired>
          <FormLabel fontSize={12}>Subject</FormLabel>
          <Select
            fontSize={'sm'}
            value={subject}
            onChange={onSubjectChange}
            placeholder='-- Select --'
            textTransform={'capitalize'}
          >
            {subOperators?.policySubjectOperatorMapping?.map((rule, index) => (
              <option
                key={index}
                value={rule.subject}
                style={{ textTransform: 'capitalize' }}
              >
                {rule.category} {rule?.name}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontSize={12}>Operator</FormLabel>
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
            <FormLabel fontSize={12}>Value</FormLabel>
            <Select
              id='operator'
              name='operator'
              value={value}
              onChange={onValueChange}
              textTransform={'capitalize'}
              fontSize='sm'
            >
              <option value=''>-- Select --</option>
              {severityList.map((item, index) => (
                <option
                  key={index}
                  value={item}
                  style={{ textTransform: 'capitalize' }}
                >
                  {item}
                </option>
              ))}
            </Select>
          </FormControl>
        )}
        {operator === 'RANGE' && (
          <Grid templateColumns={`repeat(2,1fr)`} gap={4}>
            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={12}>Min</FormLabel>
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
                <FormLabel fontSize={12}>Max</FormLabel>
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
            <FormLabel fontSize={12}>Value</FormLabel>
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
    </LynkModal>
  )
}

export default RuleModal
