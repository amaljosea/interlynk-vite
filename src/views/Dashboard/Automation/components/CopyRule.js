import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { capitalizeFirstLetter, disableButtonTemporarily } from 'utils'

import { CopyIcon } from '@chakra-ui/icons'
import { Text, chakra } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

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
    disableButtonTemporarily(setIsDisabled)
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
            description: 'Rule copied successfully',
            status: 'success'
          })
          onClose()
        }
      })
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'Copy Automation'}
      onSubmit={onSubmit}
      disabled={isDisabled || error !== ''}
      buttonText='Copy'
      Icon={CopyIcon}
    >
      {/* ERROR HANDLING */}
      {error !== '' && <LynkAlert msg={error} />}
      {/* DETAILS */}
      <Text>
        Copy Rule <chakra.span fontWeight={'semibold'}>{ruleName}</chakra.span>{' '}
        to{' '}
        <chakra.span fontWeight={'semibold'}>
          {capitalizeFirstLetter(projectName)}
        </chakra.span>
      </Text>
      <Text>
        This will copy the current rule, conditions, and actions to the
        {capitalizeFirstLetter(projectName)}. If a rule with the same name
        already exists, you must rename that first.
      </Text>
    </LynkModal>
  )
}

export default CopyRule
