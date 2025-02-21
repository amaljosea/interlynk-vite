import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { Box, Button, Select, Stack } from '@chakra-ui/react'
import { NumberInput, NumberInputField } from '@chakra-ui/react'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'

import {
  AutomationRuleCreate,
  componentSupportLevelCreate,
  componentSupportLevelUpdate
} from 'graphQL/Mutation'

import { BiWrench } from 'react-icons/bi'

const Support = ({ isOpen, onClose, activeRow, ruleExists, recheck }) => {
  const params = useParams()
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const { status, component } = activeRow || ''
  const { name, version, componentSupportLevel } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''

  const inputStyle = { size: 'md', fontSize: 'sm' }

  const [error, setError] = useState('')
  const [options, setOptions] = useState([])
  const [defaultEnv, setDefaultEnv] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])
  const [formData, setFormData] = useState({
    supportLevel: '',
    endOfSupport: '',
    explanation: '',
    assessmentExpiresOn: 0
  })

  const [createRule, { loading: ruleLoading }] =
    useMutation(AutomationRuleCreate)
  const [createSupport, { loading: createLoading }] = useMutation(
    componentSupportLevelCreate
  )
  const [updateSupport, { loading: updateLoading }] = useMutation(
    componentSupportLevelUpdate
  )

  const { projects, loading: envLoading } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

  const resolved = status === 'resolved'
  const disabled =
    formData?.supportLevel === '' && formData?.endOfSupport === ''

  const handleChange = (e) => {
    const { name, value } = e.target
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

  const handleCheckboxChange = (env, isChecked) => {
    if (env.value === defaultEnv.value) {
      // Default option cannot be unchecked
      return
    }
    if (isChecked) {
      setSelectedEnvironments((prev) => [...prev, env])
    } else {
      setSelectedEnvironments((prev) =>
        prev.filter((item) => item.value !== env.value)
      )
    }
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
        console.error('Error during rule creation', error)
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
        retainManualOverrideFor:
          Number(formData?.assessmentExpiresOn) || undefined,
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
        retainManualOverrideFor:
          Number(formData?.assessmentExpiresOn) || undefined,
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
    const defaultOption = projects.find(
      (project) => project.id === params?.productid
    )
    if (defaultOption) {
      const defaultEnvObj = {
        value: defaultOption.id,
        label: defaultOption.name
      }
      setDefaultEnv(defaultEnvObj)
      setSelectedEnvironments([defaultEnvObj])
    }
    const otherOptions = projects
      .filter((project) => project.id !== params?.productid)
      .map((project) => ({
        value: project.id,
        label: project.name
      }))
    setOptions(otherOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envLoading])

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
          ? Number(retainManualOverrideFor)
          : 0
      }))
    }
  }, [componentSupportLevel])

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
      <Stack spacing={4} mt={2}>
        {error !== '' && (
          <Box>
            <LynkAlert msg={error} />
          </Box>
        )}
        {/* COMPONENT INFO */}
        {component && (
          <Box w={'fit-content'}>
            <CompInfo data={component} />
          </Box>
        )}
        {/* SUPPRT LEVEL */}
        <FormControl isRequired>
          <FormLabel htmlFor='supportLevel'>Support Level</FormLabel>
          <Select
            sx={inputStyle}
            name='supportLevel'
            value={formData?.supportLevel}
            onChange={handleChange}
          >
            <option value='' style={{ background: 'lightgray' }}>
              -- Select --
            </option>
            <option value='unspecified'>Unspecified</option>
            <option value='actively_maintained'>Actively Maintained</option>
            <option value='no_longer_maintained'>No Longer Maintained</option>
            <option value='abandoned'>Abandoned</option>
          </Select>
        </FormControl>
        {/* END-OF-SUPPORT DATE */}
        <FormControl>
          <FormLabel htmlFor='endOfSupport'>End-Of-Support Date</FormLabel>
          <LynkDate
            name='endOfSupport'
            value={formData?.endOfSupport}
            onChange={(value) => handleDateChange(value, 'endOfSupport')}
          />
        </FormControl>
        {/* RETAIN MANNUAL OVERRIDE */}
        <FormControl>
          <FormLabel htmlFor='assessmentExpiresOn'>
            Assessment Expires On
          </FormLabel>
          <InputGroup>
            <NumberInput
              max={365}
              w={'100%'}
              name='assessmentExpiresOn'
              value={formData?.assessmentExpiresOn}
              onChange={(valueString) =>
                setFormData((prev) => ({
                  ...prev,
                  assessmentExpiresOn: valueString
                }))
              }
            >
              <NumberInputField fontSize={'sm'} borderRightRadius={0} />
            </NumberInput>
            <InputRightAddon>Days</InputRightAddon>
          </InputGroup>
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
