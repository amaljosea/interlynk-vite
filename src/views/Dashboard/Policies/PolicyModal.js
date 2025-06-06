import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Text,
  Textarea
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import { PolicyCreate, PolicyUpdate } from 'graphQL/Mutation'

import { LuCirclePlus, LuShieldCheck } from 'react-icons/lu'

import PolicyConditions from './components/PolicyConditions'

const PolicyModal = ({ data, isOpen, onClose, plSubjects }) => {
  const initialState = {
    name: '',
    desc: '',
    operator: '',
    resultType: '',
    isPrimary: false,
    isInternal: false,
    notification: true
  }
  const [formData, setFormData] = useState(initialState)
  const [error, setError] = useState('')
  const [conditions, setConditions] = useState([
    {
      id: 1,
      subject: '',
      operator: '',
      value: '',
      list: [],
      status: 'CREATED',
      min: '0',
      max: '0',
      subError: '',
      opError: '',
      valError: ''
    }
  ])
  const [deletedRules, setDeletedRules] = useState([])

  const [createPolicy, { loading: crLoading }] = useMutation(PolicyCreate)
  const [updatePolicy, { loading: upLoading }] = useMutation(PolicyUpdate)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  const handleSelectChange = (selectedItem, type) => {
    const { value } = selectedItem
    setFormData((prev) => ({
      ...prev,
      [type]: value
    }))
    setError('')
  }

  const hasSimilarRow = (data) => {
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (
          data[i].subject === data[j].subject &&
          data[i].operator === data[j].operator &&
          data[i].value === data[j].value
        ) {
          return true // Similar row found
        }
      }
    }
    return false // No similar rows found
  }

  const addRow = () => {
    if (hasSimilarRow(conditions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      setError('')
      const newId = conditions?.length + 1
      setConditions([
        ...conditions,
        {
          id: newId,
          subject: '',
          operator: '',
          value: '',
          list: [],
          status: 'CREATED',
          min: '0',
          max: '0',
          subError: '',
          opError: '',
          valError: ''
        }
      ])
    }
  }

  const clearState = () => {
    setFormData(initialState)
    onClose()
  }

  const handleCreate = () => {
    if (
      formData?.name === '' ||
      formData?.resultType === '' ||
      formData?.operator === ''
    ) {
      setError('Please enter all required fields')
      return
    }
    const rules = []
    if (conditions?.length > 0) {
      conditions?.map((item) =>
        rules?.push({
          operator: item?.operator,
          subject: item?.subject,
          value:
            item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'
              ? undefined
              : item?.operator === 'RANGE'
                ? JSON.stringify(
                    { min: Number(item?.min), max: Number(item?.max) },
                    null,
                    2
                  )
                : item?.value
        })
      )
    }
    createPolicy({
      variables: {
        name: formData?.name,
        desc: formData?.desc,
        isEnabled: true,
        notification: formData?.notification,
        excludeInternalComponent: formData?.isInternal,
        excludePrimaryComponent: formData?.isPrimary,
        operator: formData?.operator || undefined,
        resultType: formData?.resultType || undefined,
        policyRulesAttributes: rules?.length > 0 ? rules : undefined
      }
    }).then((res) => {
      const errors = res?.data?.policyCreate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        setError('')
        clearState()
      }
    })
  }

  let prevRules = []
  const existingData = conditions?.filter((item) => item?.status === 'ADDED')
  existingData?.map((item) =>
    prevRules?.push({
      id: item?.id,
      operator: item?.operator,
      subject: item?.subject,
      value:
        item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'
          ? undefined
          : item?.operator === 'RANGE'
            ? JSON.stringify(
                { min: Number(item?.min), max: Number(item?.max) },
                null,
                2
              )
            : item?.value
    })
  )
  let newRules = []
  const newData = conditions?.filter((item) => item?.status === 'CREATED')
  newData?.map((item) =>
    newRules?.push({
      operator: item?.operator,
      subject: item?.subject,
      value:
        item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'
          ? undefined
          : item?.operator === 'RANGE'
            ? JSON.stringify(
                { min: Number(item?.min), max: Number(item?.max) },
                null,
                2
              )
            : item?.value
    })
  )
  let deleteRules = []
  deletedRules?.map((item) =>
    deleteRules?.push({ id: item?.id, _destroy: true })
  )

  const inputData = (rules) => {
    return {
      id: data?.id,
      name: formData?.name,
      desc: formData?.desc,
      isEnabled: data?.isEnabled,
      policyRulesAttributes: rules,
      operator: formData?.operator || undefined,
      notification: formData?.notification,
      excludePrimaryComponent: formData?.isPrimary,
      resultType: formData?.resultType || undefined,
      excludeInternalComponent: formData?.isInternal
    }
  }

  const handleUpdate = () => {
    if (
      formData?.name === '' ||
      formData?.resultType === '' ||
      formData?.operator === ''
    ) {
      setError('Please enter all required fields')
      return
    }
    if (prevRules?.length > 0) {
      updatePolicy({ variables: inputData(prevRules) }).then((res) => {
        const errors = res?.data?.policyUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          clearState()
        }
      })
    }
    if (newRules?.length > 0) {
      updatePolicy({ variables: inputData(newRules) }).then((res) => {
        const errors = res?.data?.policyUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          clearState()
        }
      })
    }
    if (deleteRules?.length > 0) {
      updatePolicy({ variables: inputData(deleteRules) }).then((res) => {
        const errors = res?.data?.policyUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          clearState()
        }
      })
    }
  }

  const checkDataValidity = (data) => {
    for (let i = 0; i < data.length; i++) {
      const {
        subject,
        operator,
        value,
        min,
        max,
        subError,
        opError,
        valError
      } = data[i]
      if (
        subject === '' ||
        operator === '' ||
        (operator !== 'EXISTS' && operator !== 'NOT_EXISTS' && value === '') ||
        min === '' ||
        max === '' ||
        subError !== '' ||
        opError !== '' ||
        valError !== ''
      ) {
        return 'Error: Some properties are empty'
      }
    }
    return null
  }

  const errorMessage = checkDataValidity(conditions)

  useEffect(() => {
    if (data && plSubjects) {
      const getOperator = (operator) => {
        const upperOperator = operator?.toUpperCase()
        return upperOperator === 'ANY' || upperOperator === 'ALL'
          ? upperOperator
          : ''
      }
      const getResultType = (resultType) => {
        const upperResultType = resultType?.toUpperCase()
        return upperResultType === 'WARN' || upperResultType === 'INFORM'
          ? upperResultType
          : 'FAIL'
      }
      setFormData(() => ({
        name: data?.name,
        desc: data?.description,
        operator: getOperator(data?.operator),
        notification: data?.notificationEnabled,
        isPrimary: data?.excludePrimaryComponent,
        isInternal: data?.excludeInternalComponent,
        resultType: getResultType(data?.resultType)
      }))
      const rules = []
      const opList = (item) =>
        plSubjects?.find((op) => op?.subject === item?.subject)
      data?.policyRules?.map((item) =>
        rules?.push({
          id: item?.id,
          subject: item?.subject,
          operator: item?.operator,
          value:
            item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'
              ? 'Defined'
              : item?.value,
          list: opList(item)?.operators,
          status: 'ADDED',
          min: item?.operator === 'RANGE' ? JSON.parse(item?.value)?.min : '0',
          max: item?.operator === 'RANGE' ? JSON.parse(item?.value)?.max : '0',
          subError: '',
          opError: '',
          valError: ''
        })
      )
      setConditions(rules)
    }
  }, [data, plSubjects])

  const resultTypeOptions = [
    { label: '-- Select --', value: '' },
    { label: 'INFORM', value: 'INFORM' },
    { label: 'WARN', value: 'WARN' },
    { label: 'FAIL', value: 'FAIL' }
  ]

  const operatorOptions = [
    { label: '-- Select --', value: '' },
    { label: 'ANY', value: 'ANY' },
    { label: 'ALL', value: 'ALL' }
  ]

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        Icon={LuShieldCheck}
        onClose={onClose}
        buttonText={data ? 'Update' : 'Save'}
        disabled={errorMessage || error !== ''}
        isLoading={data ? upLoading : crLoading}
        title={`${data ? 'Edit' : 'Create'} Policy`}
        onSubmit={data ? handleUpdate : handleCreate}
      >
        <Flex
          width={'100%'}
          alignItems={'flex-start'}
          direction={'column'}
          gap={4}
        >
          {/* POLICY NAME */}
          <FormControl isRequired>
            <FormLabel htmlFor='name'>Name</FormLabel>
            <Input
              type='text'
              name='name'
              fontSize='sm'
              placeholder='Enter name'
              value={formData?.name}
              onChange={handleChange}
            />
          </FormControl>
          {/* POLICY DESCTIPTION */}
          <FormControl>
            <FormLabel htmlFor='desc'>Description</FormLabel>
            <Textarea
              name='desc'
              value={formData?.desc}
              onChange={handleChange}
              placeholder='Enter description'
            />
          </FormControl>
          <SimpleGrid w='100%' columns={2} gap={4}>
            {/* POLICY RESULT AND TYPE */}
            <FormControl isRequired>
              <FormLabel htmlFor='resultType'>Policy Result</FormLabel>
              <LynkSelect
                name='resultType'
                value={resultTypeOptions.find(
                  (opt) => opt.value === formData?.resultType
                )}
                onChange={(selectedItem) =>
                  handleSelectChange(selectedItem, 'resultType')
                }
                options={resultTypeOptions}
                id='policy_result_type'
                dropDown
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor='operator'>On Conditions</FormLabel>
              <LynkSelect
                name='operator'
                value={operatorOptions.find(
                  (opt) => opt.value === formData?.operator
                )}
                onChange={(selectedItem) =>
                  handleSelectChange(selectedItem, 'operator')
                }
                options={operatorOptions}
                id='policy_result_condition'
                dropDown
              />
            </FormControl>
          </SimpleGrid>
          {/* CONDITIONS */}
          <FormControl isRequired>
            <FormLabel htmlFor='conditions'>Conditions</FormLabel>
            <PolicyConditions
              conditions={conditions}
              setConditions={setConditions}
              setError={setError}
              setDeletedRules={setDeletedRules}
              plSubjects={plSubjects}
              formData={formData}
            />
          </FormControl>
          {/* ADD CONDITIONS */}
          <Button
            variant='link'
            onClick={addRow}
            colorScheme='blue'
            leftIcon={<LuCirclePlus size={18} />}
            title='Add policy condition'
            data-testid='add_policy_condition'
            sx={{ fontSize: 'sm', fontWeight: 'medium', pl: '2px' }}
          >
            Add condition
          </Button>
          <Divider />
          {/* APPLY CONDITION */}
          <FormControl>
            <FormLabel htmlFor='doesNptapplyTo'>Does not apply to</FormLabel>
            <Flex mt={2} gap={5} align={'center'}>
              <Checkbox
                name='isPrimary'
                isChecked={formData?.isPrimary}
                onChange={handleChange}
              >
                <Text fontSize={14}>Primary Component</Text>
              </Checkbox>
              <Checkbox
                name='isInternal'
                isChecked={formData?.isInternal}
                onChange={handleChange}
              >
                <Text fontSize={14}>Internal Components</Text>
              </Checkbox>
            </Flex>
          </FormControl>
          <Checkbox
            name='notification'
            isChecked={formData?.notification}
            onChange={handleChange}
          >
            <Text fontSize={14}>Enable Notifications</Text>
          </Checkbox>
          {/* ERROR HANDLING */}
          {error !== '' && <LynkAlert msg={error} />}
        </Flex>
      </LynkModal>
    </>
  )
}

export default PolicyModal
