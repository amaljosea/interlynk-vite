import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTotalDays } from 'utils'
import { getDate } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { assessmentExpiryWarning } from 'variables/general'

import { Button, FormErrorMessage, Input, Stack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import {
  AutomationRuleCreate,
  componentSupportLevelCreate,
  componentSupportLevelUpdate
} from 'graphQL/Mutation'

import { BiWrench } from 'react-icons/bi'

const Support = ({ isOpen, onClose, activeRow, ruleExists, recheck }) => {
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const { status, component } = activeRow || ''

  const { name, version, componentSupportLevel } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''

  const inputStyle = { size: 'md', fontSize: 'sm' }
  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 365)

  const [error, setError] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])
  const [formData, setFormData] = useState({
    supportLevel: '',
    endOfSupport: '',
    explanation: '',
    assessmentExpiresOn: defaultDate
  })

  const [createRule, { loading: ruleLoading }] =
    useMutation(AutomationRuleCreate)
  const [createSupport, { loading: createLoading }] = useMutation(
    componentSupportLevelCreate,
    { onCompleted: () => recheck() }
  )
  const [updateSupport, { loading: updateLoading }] = useMutation(
    componentSupportLevelUpdate,
    { onCompleted: () => recheck() }
  )

  const resolved = status === 'resolved'

  const totalDays = Number(getTotalDays(formData?.assessmentExpiresOn))

  const disabled =
    formData?.supportLevel === '' ||
    (!component?.internal && totalDays < 1) ||
    (!component?.internal && totalDays > 365)

  const noLongerMaintained = formData?.supportLevel === 'no_longer_maintained'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelect = (selectedItem, name) => {
    const { value } = selectedItem
    const isUnspecified = name === 'supportLevel' && value === 'unspecified'
    if (isUnspecified) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endOfSupport: '',
        explanation: '',
        assessmentExpiresOn: 0
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleDateChange = (newDate, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newDate ? newDate._d : ''
    }))
  }

  const conditions = [
    {
      subject: 'component',
      operator: 'is',
      field: 'component_name',
      value: component?.name
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_support_level',
      value: undefined
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_end_of_support',
      value: undefined
    }
  ]

  const actions = [
    {
      subject: 'component',
      field: 'component_support_level',
      value: formData?.supportLevel
        ? formData?.supportLevel.replaceAll(' ', '_').toUpperCase()
        : undefined
    },
    {
      subject: 'component',
      field: 'component_end_of_support',
      value: formData?.endOfSupport
        ? new Date(formData?.endOfSupport)
        : undefined
    }
  ]

  const handleRuleCreate = async () => {
    if (ruleExists) {
      navigate(link)
    } else {
      const projectIds = selectedEnvironments?.map((option) => option.value)
      const mutationPromises = projectIds.map((id) =>
        createRule({
          variables: {
            active: true,
            projectId: id,
            name: shortDesc,
            checkComponent: name,
            checkVersion: version,
            checkIdentifier: friendlyId,
            automationActionsAttributes: actions,
            automationConditionsAttributes: conditions
          }
        })
      )
      try {
        const res = await Promise.all(mutationPromises)
        const errors = res?.flatMap(
          (r) => r?.data?.automationRuleCreate?.errors || []
        )
        if (errors.length > 0) {
          setError(errors[0])
        } else {
          showToast({
            description: 'Rule added successfully',
            status: 'success'
          })
        }
      } catch (error) {
        setError('An unexpected error occurred.')
      }
    }
  }

  const handleRecheck = () => {
    recheck()
    onClose()
  }

  const handleCreate = async (applyRule) => {
    await createSupport({
      variables: {
        id: component?.id,
        level: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor: totalDays > 0 ? totalDays : undefined,
        endDate: formData?.endOfSupport
          ? new Date(formData?.endOfSupport).toISOString()
          : undefined
      }
    })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelCreate || {}
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: 'Support level added successfully',
            status: 'success'
          })
          applyRule && handleRuleCreate()
        }
      })
      .finally(() => handleRecheck())
  }

  const handleUpdate = async (applyRule) => {
    await updateSupport({
      variables: {
        id: componentSupportLevel?.id,
        level: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor: totalDays > 0 ? totalDays : undefined,
        endDate: formData?.endOfSupport
          ? new Date(formData?.endOfSupport).toISOString()
          : undefined
      }
    })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelUpdate || {}
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: 'Support level updated successfully',
            status: 'success'
          })
          applyRule && handleRuleCreate()
        }
      })
      .finally(() => handleRecheck())
  }

  const handleSubmit = () =>
    componentSupportLevel?.id ? handleUpdate(false) : handleCreate(false)

  const { AUTOMATION_RULES } = ProductDetailsTabs
  const link = generateProductDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: AUTOMATION_RULES
    }
  })

  const handleAutomation = async () => {
    if (resolved) {
      await handleRuleCreate().then(() => onClose())
    } else {
      componentSupportLevel?.id
        ? await handleUpdate(true)
        : await handleCreate(true)
    }
  }

  const RuleAction = () => {
    return (
      <Button
        mr={'auto'}
        fontSize={'sm'}
        variant='ghost'
        isDisabled={disabled}
        isLoading={ruleLoading}
        loadingText='Loading...'
        onClick={handleAutomation}
        colorScheme={ruleExists ? 'green' : 'blue'}
        title={`${ruleExists ? 'View' : 'Save as'} Rule`}
      >
        {ruleExists ? 'View' : 'Save as'} Rule
      </Button>
    )
  }

  useEffect(() => {
    if (componentSupportLevel) {
      const { level, endDate, notes, retainManualOverrideFor } =
        componentSupportLevel || {}
      setFormData((prev) => ({
        ...prev,
        explanation: notes || '',
        supportLevel: level || '',
        endOfSupport: endDate ? new Date(endDate) : '',
        assessmentExpiresOn: retainManualOverrideFor
          ? getDate(retainManualOverrideFor)
          : undefined
      }))
    }
  }, [componentSupportLevel])

  const supportLevelOptions = [
    { value: '', label: '-- Select --' },
    { value: 'unspecified', label: 'Unspecified' },
    { value: 'actively_maintained', label: 'Actively Maintained' },
    { value: 'no_longer_maintained', label: 'No Longer Maintained' },
    { value: 'abandoned', label: 'Abandoned' }
  ]

  return (
    <LynkModal
      isOpen={isOpen}
      Icon={BiWrench}
      onClose={onClose}
      disabled={disabled}
      buttonText={'Save'}
      onSubmit={handleSubmit}
      title={'Component Support'}
      hideCancelButton={ruleLoading}
      hidden={resolved || ruleLoading}
      isLoading={createLoading || updateLoading}
      leftFooterContent={!isFreeTier && <RuleAction />}
    >
      <Stack mb={error || component ? 4 : 0}>
        {error !== '' && <LynkAlert msg={error} />}
        {component && <CompInfo data={component} />}
      </Stack>

      <Stack spacing={4} mt={2}>
        {/* SUPPRT LEVEL */}
        <FormControl isRequired>
          <FormLabel htmlFor='supportLevel'>Support Level</FormLabel>
          <LynkSelect
            styles={inputStyle}
            name='supportLevel'
            value={
              supportLevelOptions.find(
                (opt) => opt.value === formData?.supportLevel
              ) || null
            }
            onChange={(selected) => handleSelect(selected, 'supportLevel')}
            options={supportLevelOptions}
            dropDown
          />
        </FormControl>
        {/* END-OF-SUPPORT DATE */}
        {(formData?.supportLevel === 'actively_maintained' ||
          formData?.supportLevel === 'no_longer_maintained') && (
          <FormControl>
            <FormLabel htmlFor='endOfSupport'>End-Of-Support Date</FormLabel>
            <LynkDate
              name='endOfSupport'
              value={formData?.endOfSupport}
              onChange={(value) => handleDateChange(value, 'endOfSupport')}
            />
          </FormControl>
        )}
        {/* RETAIN MANNUAL OVERRIDE */}
        <FormControl
          hidden={noLongerMaintained}
          isInvalid={totalDays > 365}
          isRequired={!component?.internal}
        >
          <FormLabel htmlFor='assessmentExpiresOn'>
            Assessment Expires On
          </FormLabel>
          <LynkDate
            name='assessmentExpiresOn'
            value={formData?.assessmentExpiresOn}
            onChange={(value) => handleDateChange(value, 'assessmentExpiresOn')}
          />
          <FormErrorMessage>{assessmentExpiryWarning}</FormErrorMessage>
        </FormControl>
        {/* EXPLANATION */}
        <FormControl>
          <FormLabel htmlFor='explanation'>Explanation</FormLabel>
          <Input
            sx={inputStyle}
            name='explanation'
            value={formData?.explanation}
            placeholder='Enter explanation'
            onChange={handleChange}
          />
        </FormControl>
        {!ruleExists && (
          <EnvironmentSelector
            fixed={resolved}
            ruleExists={ruleExists}
            environments={selectedEnvironments}
            setEnvironments={setSelectedEnvironments}
          />
        )}
      </Stack>
    </LynkModal>
  )
}

export default Support
