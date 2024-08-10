import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { capitalizeFirstLetter } from 'utils'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  chakra
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { AutomationRuleCreate } from 'graphQL/Mutation'
import { GetAutomationNames } from 'graphQL/Queries'

const CopyRule = ({ isOpen, onClose, env, data }) => {
  const { showToast } = useCustomToast()
  const { name: ruleName, automationActions, automationConditions } = data || ''
  const { name: projectName, id: projectId } = env || ''

  const [createRule] = useMutation(AutomationRuleCreate)

  const { data: rule } = useQuery(GetAutomationNames, {
    skip: !env,
    variables: {
      id: env?.id
    }
  })

  const { nodes } = rule?.project?.automationRules || ''

  const [error, setError] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)

  const disableButtonTemporarily = () => {
    setIsDisabled(true)
    setTimeout(() => {
      setIsDisabled(false)
    }, 3000)
  }

  const conditionsAttributes = []
  const actionsAttributes = []
  automationConditions?.map((item) =>
    conditionsAttributes?.push({
      subject: item?.subject,
      operator: item?.operator,
      field: item?.field,
      value: item?.value || undefined
    })
  )
  automationActions?.map((item) =>
    actionsAttributes?.push({
      subject: item?.subject,
      field: item?.field,
      value: item?.value
    })
  )

  const onSubmit = () => {
    disableButtonTemporarily()
    const existingRules = nodes?.filter((item) => item?.name === ruleName)
    if (existingRules?.length > 0) {
      setError(
        'An automation rule with the same name already exists in that environment.'
      )
    } else {
      createRule({
        variables: {
          active: true,
          name: ruleName,
          projectId: projectId,
          automationConditionsAttributes: conditionsAttributes,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          showToast({
            description: 'Copy rule completed',
            status: 'success'
          })
          onClose()
        }
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Copy Automation</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Flex} flexDirection='column' gap={3}>
          {/* ERROR HANDLING */}
          <Alert status='error' borderRadius={4} hidden={error === ''}>
            <AlertIcon />
            <AlertDescription fontSize={'sm'} pr={2}>
              {error}
            </AlertDescription>
          </Alert>
          {/* DETAILS */}
          <Text>
            Copy Rule{' '}
            <chakra.span fontWeight={'semibold'}>{ruleName}</chakra.span> to{' '}
            <chakra.span fontWeight={'semibold'}>
              {capitalizeFirstLetter(projectName)}
            </chakra.span>
          </Text>
          <Text>
            This will copy the current rule, conditions, and actions to the
            {capitalizeFirstLetter(projectName)}. If a rule with the same name
            already exists, you must rename that first.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme='blue'
            onClick={onSubmit}
            isDisabled={isDisabled || error !== ''}
          >
            Copy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CopyRule
