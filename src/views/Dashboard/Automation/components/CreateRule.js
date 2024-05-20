import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getIcon, getLabel, updatedValue } from 'utils'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  Kbd,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tooltip
} from '@chakra-ui/react'

import { AutomationRuleCreate, AutomationRuleUpdate } from 'graphQL/Mutation'

import { FaPlus, FaTrash } from 'react-icons/fa6'

const SubjectIcon = ({ subject, isSystem = { isSystem } }) => {
  return (
    <Box hidden={subject === ''} mt={2}>
      <Tooltip label={getLabel(subject)} placement='top'>
        <Box>
          <Icon
            color={isSystem ? 'gray.300' : 'blue.500'}
            as={getIcon(subject)}
          />
        </Box>
      </Tooltip>
    </Box>
  )
}

const CreateRule = ({ data, refetch, isOpen, onClose, subOperators }) => {
  const params = useParams()
  const projectId = params?.productid

  const { automationConditionSubjectFieldMapping } = subOperators || []

  const sortedData = [...automationConditionSubjectFieldMapping]?.sort((a, b) =>
    a?.subject.localeCompare(b?.subject)
  )

  const categories = [...new Set(sortedData?.map((item) => item.subject))]

  const optionsByCategory = categories.reduce((acc, subject) => {
    const options = automationConditionSubjectFieldMapping
      ?.filter((item) => item.subject === subject)
      ?.map((item) => (
        <option value={item.key} key={item?.key}>
          {item.name}
        </option>
      ))
    acc[subject] = options
    return acc
  }, {})

  const [error, setError] = useState('')
  const [ruleName, setRuleName] = useState('')
  const [conditions, setConditions] = useState([
    {
      id: 1,
      category: '',
      subject: '',
      operator: '',
      value: '',
      list: [],
      subError: '',
      opError: '',
      valError: '',
      status: 'CREATED'
    }
  ])
  const [actions, setActions] = useState([
    {
      id: 1,
      value: '',
      subject: '',
      status: 'CREATED',
      operator: 'set',
      field: ''
    }
  ])
  const [deletedCondition, setDeletedCondition] = useState([])
  const [deleteAction, setDeleteAction] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)

  const isSystem = actions?.some((item) => item?.operator === 'copy')

  const disableButtonTemporarily = () => {
    setIsDisabled(true)
    setTimeout(() => {
      setIsDisabled(false)
    }, 3000)
  }

  const isComponent = conditions?.some((item) => item?.category === 'component')
  // const isVersion = conditions?.some((item) => item?.category === 'version')

  const [createRule] = useMutation(AutomationRuleCreate, {
    onCompleted: (data) => data && refetch()
  })
  const [updateRule] = useMutation(AutomationRuleUpdate, {
    onCompleted: (data) => data && refetch()
  })

  const checkActionValidity = (data) => {
    for (let i = 0; i < data.length; i++) {
      const { subject, field, value } = data[i]
      if (subject === '' || field === '' || value === '') {
        return 'Error: Some properties are empty'
      }
    }
    return null
  }

  const checkConditionValidity = (data) => {
    for (let i = 0; i < data.length; i++) {
      const { subject, operator, value, subError, opError, valError } = data[i]
      if (
        subject === '' ||
        operator === '' ||
        (operator !== 'exists' && operator !== 'not_exists' && value === '') ||
        subError !== '' ||
        opError !== '' ||
        valError !== ''
      ) {
        return 'Error: Some properties are empty'
      }
    }
    return null
  }

  const conditionErrorMessage = checkConditionValidity(conditions)
  const actionErrorMessage = checkActionValidity(actions)

  const submitError =
    conditionErrorMessage ||
    actionErrorMessage ||
    error !== '' ||
    ruleName === '' ||
    isDisabled ||
    actions?.length === 0 ||
    conditions?.length === 0

  const hasSimilarConditions = (data) => {
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (
          data[i].subject === data[j].subject &&
          data[i].operator === data[j].operator &&
          data[i].value === data[j].value
        ) {
          return true
        }
      }
    }
    return false
  }

  const hasSimilarActions = (data) => {
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (
          data[i].field === data[j].field &&
          data[i].value === data[j].value
        ) {
          return true
        }
      }
    }
    return false
  }

  const onAddCondtion = () => {
    if (hasSimilarConditions(conditions)) {
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
          subError: '',
          opError: '',
          valError: '',
          status: 'CREATED'
        }
      ])
    }
  }

  const onAddAction = () => {
    if (hasSimilarActions(actions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      setError('')
      const newId = actions?.length + 1
      setActions([
        ...actions,
        {
          id: newId,
          value: '',
          subject: isComponent ? 'component' : 'version',
          operator: 'set',
          status: 'CREATED',
          field: ''
        }
      ])
    }
  }

  const onDeleteCondtion = (rule) => {
    setError('')
    const newData = conditions?.filter((item) => item.id !== rule?.id)
    setConditions(newData)
    if (rule?.status === 'ADDED') {
      setDeletedCondition((prev) => [...prev, rule])
    }
  }

  const onDeleteAction = (action) => {
    setError('')
    const newData = actions?.filter((item) => item.id !== action?.id)
    setActions(newData)
    if (action?.status === 'ADDED') {
      setDeleteAction((prev) => [...prev, action])
    }
  }

  const onNameChange = (e) => setRuleName(e.target.value)

  const onSubjectBlur = (rule) => {
    const newData = conditions.map((item) => {
      if (item.id === rule?.id) {
        if (rule?.subject === '') {
          return { ...item, subError: 'Select any subject' }
        } else {
          return { ...item, subError: '' }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const onOperatorBlur = (rule) => {
    const newData = conditions.map((item) => {
      if (item.id === rule?.id) {
        if (rule?.operator === '') {
          return { ...item, opError: 'Select any operator' }
        } else {
          return { ...item, opError: '' }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const onCondtionChange = (value, id, field) => {
    setError('')
    const newData = conditions.map((item) => {
      if (item.id === id) {
        if (field === 'subject' && value !== '') {
          const result = automationConditionSubjectFieldMapping?.find(
            (item) => item?.key === value
          )
          return {
            ...item,
            [field]: value,
            category: result?.subject,
            list: result?.operators
          }
        } else {
          return { ...item, [field]: value }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const onActionChange = (value, id, field) => {
    setError('')
    const newData = actions.map((item) => {
      if (item.id === id) {
        if (field === 'field' && value !== '') {
          return {
            ...item,
            [field]: value,
            subject: isComponent ? 'component' : 'version'
          }
        } else {
          return { ...item, [field]: value }
        }
      }
      return item
    })
    setActions(newData)
  }

  const conditionsAttributes = []
  const actionsAttributes = []
  conditions?.length > 0 &&
    conditions?.map((item) =>
      conditionsAttributes?.push({
        id: item?.status === 'CREATED' ? undefined : item?.id,
        subject: item?.category,
        operator: item?.operator,
        field: item?.subject,
        value:
          item?.operator === 'exists' || item?.operator === 'not_exists'
            ? undefined
            : item?.value
      })
    )
  actions?.length > 0 &&
    actions?.map((item) =>
      actionsAttributes?.push({
        id: item?.status === 'CREATED' ? undefined : item?.id,
        subject: item?.subject,
        field: item?.field,
        value: item?.value
      })
    )

  const handleRuleCreate = async () => {
    disableButtonTemporarily()
    if (hasSimilarConditions(conditions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else if (hasSimilarActions(actions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      await createRule({
        variables: {
          name: ruleName,
          active: true,
          projectId: projectId,
          automationConditionsAttributes: conditionsAttributes,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          onClose()
        }
      })
    }
  }

  const handleRuleUpdate = () => {
    disableButtonTemporarily()
    if (deletedCondition?.length > 0) {
      deletedCondition?.map((item) =>
        conditionsAttributes?.push({ id: item?.id, _destroy: true })
      )
    }
    if (deleteAction?.length > 0) {
      deleteAction?.map((item) =>
        actionsAttributes?.push({ id: item?.id, _destroy: true })
      )
    }
    if (hasSimilarConditions(conditions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else if (hasSimilarActions(actions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      updateRule({
        variables: {
          id: data?.id,
          name: ruleName,
          active: data?.active,
          automationConditionsAttributes: conditionsAttributes,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          onClose()
        }
      })
    }
  }

  useEffect(() => {
    if (data) {
      const { name, automationActions, automationConditions } = data || ''
      const allConditions = []
      const allActions = []
      automationConditions?.map((item) =>
        allConditions.push({
          id: item?.id,
          category: item?.subject,
          subject: item?.field,
          operator: item?.operator,
          value: item?.value,
          list: automationConditionSubjectFieldMapping?.find(
            (sub) => sub?.key === item?.field
          ).operators,
          subError: '',
          opError: '',
          valError: '',
          status: 'ADDED'
        })
      )
      automationActions?.map((item) =>
        allActions.push({
          id: item?.id,
          status: 'ADDED',
          field: item?.field,
          operator: item?.operator,
          value: item?.value,
          subject: item?.subject
        })
      )
      setRuleName(name)
      setConditions(allConditions)
      setActions(allActions)
    }
  }, [data, automationConditionSubjectFieldMapping])

  return (
    <Modal
      size='5xl'
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{data ? 'Edit' : 'Create'} Rule</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex flexDir={'column'} alignItems={'flex-start'} gap={4}>
            <FormControl isRequired>
              <FormLabel htmlFor='ruleName'>Rule Name</FormLabel>
              <Input
                type='text'
                name='ruleName'
                fontSize={'sm'}
                placeholder='Enter rule name'
                value={ruleName}
                onChange={onNameChange}
                pointerEvents={isSystem ? 'none' : 'auto'}
              />
            </FormControl>
            {/* CONDITIONS */}
            <FormControl>
              <FormLabel htmlFor='conditions'>Conditions</FormLabel>
              {conditions?.length > 0 &&
                conditions?.map((item, index) => (
                  <Flex
                    gap={4}
                    mt={2}
                    key={index}
                    width={'100%'}
                    alignItems={'flex-start'}
                    justifyContent={'space-bewteen'}
                  >
                    {/* ICON */}
                    <SubjectIcon subject={item?.subject} isSystem={isSystem} />
                    {/* SUBJECT */}
                    <FormControl
                      width={'40%'}
                      isInvalid={item?.subError !== ''}
                    >
                      <Select
                        value={item?.subject}
                        onChange={(e) =>
                          onCondtionChange(e.target.value, item.id, 'subject')
                        }
                        onBlur={() => onSubjectBlur(item)}
                        placeholder='-- Subject --'
                        fontSize='sm'
                        onBlurCapture={() => onSubjectBlur(item)}
                        textTransform={'capitalize'}
                        isDisabled={isSystem}
                      >
                        {conditions?.length > 1 &&
                        conditions?.some(
                          (item) => item?.category === 'component'
                        )
                          ? [...categories]
                              ?.filter((item) => item !== 'version')
                              .map((category) => (
                                <optgroup key={category} label={category}>
                                  {optionsByCategory[category]}
                                </optgroup>
                              ))
                          : conditions?.length > 1 &&
                              conditions?.some(
                                (item) => item?.category === 'version'
                              )
                            ? [...categories]
                                ?.filter((item) => item !== 'component')
                                .map((category) => (
                                  <optgroup key={category} label={category}>
                                    {optionsByCategory[category]}
                                  </optgroup>
                                ))
                            : categories.map((category) => (
                                <optgroup key={category} label={category}>
                                  {optionsByCategory[category]}
                                </optgroup>
                              ))}
                      </Select>
                      <FormErrorMessage>{item?.subError}</FormErrorMessage>
                    </FormControl>
                    {/* OPERATOR */}
                    <FormControl width={'20%'} isInvalid={item?.opError !== ''}>
                      <Select
                        id='operator'
                        name='operator'
                        value={item?.operator}
                        onChange={(e) =>
                          onCondtionChange(e.target.value, item.id, 'operator')
                        }
                        fontSize='sm'
                        placeholder='-- Operator --'
                        onBlur={() => onOperatorBlur(item)}
                        isDisabled={isSystem}
                      >
                        {item?.list?.map((option) => (
                          <option
                            value={option}
                            key={option}
                          >
                            {updatedValue(option)}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{item?.opError}</FormErrorMessage>
                    </FormControl>
                    {item?.operator !== 'exists' &&
                      item?.operator !== 'not_exists' && (
                        <Flex width={'50%'} alignItems={'center'} gap={4}>
                          <Input
                            type={'text'}
                            fontSize='sm'
                            placeholder='Value'
                            value={item?.value}
                            onChange={(e) =>
                              onCondtionChange(e.target.value, item.id, 'value')
                            }
                          />
                        </Flex>
                      )}
                    <Flex gap={4} justifyContent={'space-between'}>
                      {conditions?.length > 1 &&
                        conditions?.length - 1 !== index && (
                          <Kbd mt={2}>AND</Kbd>
                        )}
                      {conditions?.length > 1 && (
                        <Icon
                          ml={'auto'}
                          mt={2}
                          as={FaTrash}
                          color={'red.500'}
                          cursor={'pointer'}
                          onClick={() => onDeleteCondtion(item)}
                        />
                      )}
                    </Flex>
                  </Flex>
                ))}
            </FormControl>
            <Button
              fontSize={'sm'}
              colorScheme='blue'
              variant='link'
              fontWeight={'medium'}
              leftIcon={<FaPlus />}
              onClick={onAddCondtion}
              isDisabled={isSystem}
            >
              Add condition
            </Button>
            <Divider />
            {/* ACTIONS */}
            <FormControl>
              <FormLabel htmlFor='actions'>Actions</FormLabel>
              {actions?.length > 0 &&
                actions?.map((item, index) => (
                  <Flex
                    gap={4}
                    mt={2}
                    key={index}
                    width={'100%'}
                    alignItems={'flex-start'}
                    justifyContent={'space-bewteen'}
                  >
                    {/* ICON */}
                    <SubjectIcon subject={item?.subject} isSystem={isSystem} />
                    {/* SUBJECT */}
                    <FormControl as={Flex} alignItems='center'>
                      <Select
                        value={item?.field}
                        onChange={(e) =>
                          onActionChange(e.target.value, item.id, 'field')
                        }
                        placeholder='-- Subject --'
                        fontSize='sm'
                        textTransform={'capitalize'}
                        isDisabled={
                          conditionErrorMessage ||
                          conditions?.length === 0 ||
                          isSystem
                        }
                      >
                        {conditions?.some(
                          (item) => item?.category === 'component'
                        )
                          ? [...categories]
                              ?.filter((item) => item !== 'version')
                              .map((category) => (
                                <optgroup key={category} label={category}>
                                  {optionsByCategory[category]}
                                </optgroup>
                              ))
                          : [...categories]
                              ?.filter((item) => item !== 'component')
                              .map((category) => (
                                <optgroup key={category} label={category}>
                                  {optionsByCategory[category]}
                                </optgroup>
                              ))}
                      </Select>
                    </FormControl>
                    {/* OPERATOR */}
                    <Input
                      width='130px'
                      fontSize={'sm'}
                      textTransform={'capitalize'}
                      defaultValue={item?.operator}
                      pointerEvents={'none'}
                      isDisabled={
                        conditionErrorMessage ||
                        conditions?.length === 0 ||
                        isSystem
                      }
                    />
                    {/* VALUE */}
                    <FormControl as={Flex} alignItems='center' gap={4}>
                      <Input
                        type={'text'}
                        fontSize='sm'
                        placeholder={'Add value'}
                        value={item.value}
                        onChange={(e) =>
                          onActionChange(e.target.value, item.id, 'value')
                        }
                        isDisabled={
                          conditionErrorMessage ||
                          conditions?.length === 0 ||
                          isSystem
                        }
                      />
                      <Flex gap={4} justifyContent={'space-between'}>
                        {actions?.length > 1 &&
                          actions?.length - 1 !== index && <Kbd>AND</Kbd>}
                        {actions?.length > 1 && (
                          <Icon
                            ml={'auto'}
                            mt={0.6}
                            as={FaTrash}
                            color={'red.500'}
                            cursor={'pointer'}
                            onClick={() => onDeleteAction(item)}
                            display={
                              conditionErrorMessage || conditions?.length === 0
                                ? 'none'
                                : 'flex'
                            }
                          />
                        )}
                      </Flex>
                    </FormControl>
                  </Flex>
                ))}
            </FormControl>
            <Button
              fontSize={'sm'}
              colorScheme='blue'
              variant='link'
              fontWeight={'medium'}
              leftIcon={<FaPlus />}
              onClick={onAddAction}
              isDisabled={isSystem}
            >
              Add action
            </Button>
            {/* ERROR HANDLING */}
            {error !== '' && (
              <Alert status='error' borderRadius={4}>
                <AlertIcon />
                <AlertDescription fontSize={'sm'} pr={2}>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter mt={2}>
          <Button colorScheme='gray' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme='blue'
            isDisabled={submitError || isSystem}
            onClick={data ? handleRuleUpdate : handleRuleCreate}
          >
            {data ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateRule
