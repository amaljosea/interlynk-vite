import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { disableButtonTemporarily } from 'utils'

import { EditIcon } from '@chakra-ui/icons'
import { Button, Flex, Input } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import { AutomationRuleCreate, AutomationRuleUpdate } from 'graphQL/Mutation'

import { FaPlus } from 'react-icons/fa6'

import RuleActions from './RuleActions'
import RuleConditions from './RuleConditions'

const CreateRule = ({ data, isOpen, onClose, subOperators }) => {
  const [selectedEnvironments, setSelectedEnvironments] = useState([])

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
  const [deleteAction, setDeleteAction] = useState([])
  const [isDisabled, setIsDisabled] = useState(false)

  const isSystem = actions?.some((item) => item?.operator === 'copy')

  const isComponent = conditions?.some((item) => item?.category === 'component')
  // const isVersion = conditions?.some((item) => item?.category === 'version')

  const [createRule, { loading: loadingCreate }] =
    useMutation(AutomationRuleCreate)
  const [updateRule, { loading: loadingUpdate }] =
    useMutation(AutomationRuleUpdate)

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

  const onNameChange = (e) => setRuleName(e.target.value)

  const getValue = (item) => {
    if (item?.operator === 'exists' || item?.operator === 'not_exists') {
      return null
    } else {
      return item?.value
    }
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
        value: getValue(item)
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

  const handleRuleCreate = () => {
    if (hasSimilarConditions(conditions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else if (hasSimilarActions(actions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      disableButtonTemporarily(setIsDisabled)
      const projectIds = selectedEnvironments?.map((option) => option.value)
      // Create a list of promises for each mutation call
      const mutationPromises = projectIds.map((id) =>
        createRule({
          variables: {
            name: ruleName,
            active: true,
            projectId: id,
            automationConditionsAttributes: conditionsAttributes,
            automationActionsAttributes: actionsAttributes
          }
        })
      )

      // Execute all mutation calls
      Promise.all(mutationPromises)
        .then((responses) => {
          const errors = responses
            .map((res) => res?.data?.automationRuleCreate?.errors)
            .flat()
            .filter(Boolean)

          if (errors.length > 0) {
            setError(errors[0])
          } else {
            onClose()
          }
        })
        .catch((error) => {
          setError(`An error occurred: ${error.message}`)
        })
        .finally(() => {
          setIsDisabled(false)
        })
    }
  }

  const handleRuleUpdate = () => {
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
      disableButtonTemporarily(setIsDisabled)
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
    <LynkModal
      isOpen={isOpen}
      Icon={EditIcon}
      onClose={onClose}
      noFooter={isSystem}
      disabled={submitError}
      buttonText={data ? 'Update' : 'Create'}
      title={`${data ? 'Edit' : 'Create'} Rule`}
      isLoading={loadingCreate || loadingUpdate}
      onSubmit={data ? handleRuleUpdate : handleRuleCreate}
    >
      <Flex flexDir={'column'} alignItems={'flex-start'} gap={4}>
        <FormControl isRequired>
          <FormLabel htmlFor='ruleName'>Rule Name</FormLabel>
          <Input
            type='text'
            name='ruleName'
            value={ruleName}
            onChange={onNameChange}
            placeholder='Enter rule name'
            sx={{ fontSize: 'sm', pointerEvents: isSystem ? 'none' : 'auto' }}
          />
        </FormControl>
        {/* CONDITIONS */}
        <FormControl>
          <FormLabel htmlFor='conditions'>Conditions</FormLabel>
          <RuleConditions
            actions={actions}
            isSystem={isSystem}
            setError={setError}
            conditions={conditions}
            setActions={setActions}
            categories={categories}
            setConditions={setConditions}
            setDeleteAction={setDeleteAction}
            optionsByCategory={optionsByCategory}
            setDeletedCondition={setDeletedCondition}
            automationConditionSubjectFieldMapping={
              automationConditionSubjectFieldMapping
            }
          />
        </FormControl>
        <Button
          fontSize={'sm'}
          colorScheme='blue'
          variant='link'
          fontWeight={'medium'}
          leftIcon={<FaPlus />}
          onClick={onAddCondtion}
          isDisabled={isSystem}
          title='Add automation condition'
        >
          Add condition
        </Button>

        {/* ACTIONS */}
        <FormControl>
          <FormLabel htmlFor='actions'>Actions</FormLabel>
          <RuleActions
            actions={actions}
            isSystem={isSystem}
            setError={setError}
            setActions={setActions}
            conditions={conditions}
            categories={categories}
            setDeleteAction={setDeleteAction}
            optionsByCategory={optionsByCategory}
            conditionErrorMessage={conditionErrorMessage}
          />
        </FormControl>
        <Button
          variant='link'
          colorScheme='blue'
          leftIcon={<FaPlus />}
          onClick={onAddAction}
          isDisabled={isSystem}
          title='Add automation action'
          sx={{ fontSize: 'sm', fontWeight: 'medium', marginBottom: 1 }}
        >
          Add action
        </Button>
        {/* Environment Select */}
        {!data && (
          <EnvironmentSelector
            environments={selectedEnvironments}
            setEnvironments={setSelectedEnvironments}
          />
        )}
        {/* ERROR HANDLING */}
        {error !== '' && <LynkAlert msg={error} />}
      </Flex>
    </LynkModal>
  )
}

export default CreateRule
