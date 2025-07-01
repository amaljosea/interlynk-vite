import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { formatString, updatedValue } from 'utils'
import { severityList } from 'variables/general'

import {
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Tag,
  createIcon
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { CreatePolicyRule, UpdatePolicyRule } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'
import { LuSquarePen } from 'react-icons/lu'

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

  const onSevChange = (item) => {
    setValue(item.value)
    setError('')
  }

  const onOperatorChange = (item) => {
    setOperator(item.value)
    setError('')
  }

  const onSubjectChange = (item) => {
    setSubject(item.value)
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
      setValue(data?.value || '')
      setOperator(data?.operator || '')
      setSubject(data?.subject || '')
    }
  }, [data])

  const subjectOptions = [
    { label: '-- Select --', value: '' },
    ...(subOperators?.policySubjectOperatorMapping
      ? subOperators.policySubjectOperatorMapping.map((rule) => ({
          value: rule.subject,
          label: `${formatString(rule.category)} ${rule.name}`
        }))
      : [])
  ]
  const operatorOptions = [
    { label: '-- Select --', value: '' },
    ...(filterOperators?.operators?.map((item) => ({
      value: item,
      label: updatedValue(item)
    })) || [])
  ]

  const severityOptions = [
    { label: '-- Select --', value: '' },
    ...severityList.map((item) => {
      return { label: formatString(item), value: item }
    })
  ]

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${data ? 'Edit' : 'Create'} Policy Rule`}
      buttonText={data ? 'Update' : 'Save'}
      disabled={isInvalid}
      onSubmit={data ? handleUpdate : handleCreate}
      Icon={data ? LuSquarePen : createIcon}
    >
      <Tag colorScheme='blue' mb={4} wordBreak={'break-all'}>
        {activeRow?.name}
      </Tag>
      <Flex width={'100%'} direction={'column'} gap={4}>
        {error !== '' && <LynkAlert msg={error} />}
        <FormControl isRequired>
          <FormLabel>Subject</FormLabel>
          <LynkSelect
            value={subjectOptions?.find((option) => option.value === subject)}
            onChange={(selectedOption) => onSubjectChange(selectedOption)}
            options={subjectOptions}
            placeholder='-- Select --'
            dropDown
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Operator</FormLabel>
          <LynkSelect
            id='operator'
            name='operator'
            value={operatorOptions?.find((option) => option.value === operator)}
            onChange={(selectedOption) => onOperatorChange(selectedOption)}
            options={operatorOptions}
            placeholder='-- Select --'
            dropDown
          />
        </FormControl>
        {subject === 'VULNERABILITY_SEV' && (
          <FormControl isRequired>
            <FormLabel>Value</FormLabel>
            <LynkSelect
              id='operator'
              name='operator'
              value={severityOptions.find((option) => option.value === value)}
              onChange={(selectedOption) => onSevChange(selectedOption)}
              options={severityOptions}
              placeholder='-- Select --'
              dropDown
            />
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
    </LynkModal>
  )
}

export default RuleModal
