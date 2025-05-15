import { useMutation } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'

import { Button, Input, Stack } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { AutomationRuleCreate, addComSupplier } from 'graphQL/Mutation'
import { updateComSupplier } from 'graphQL/Mutation'

import { LuContainer } from 'react-icons/lu'

const SupplierModal = (props) => {
  const { isOpen, onClose, activeRow, ruleExists, recheck } = props

  const navigate = useNavigate()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { showToast } = useCustomToast()

  const [error, setError] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const [createSupplier, { loading: createLoading }] = useMutation(
    addComSupplier,
    { onCompleted: () => recheck() }
  )
  const [updateSupplier, { loading: updateLoading }] = useMutation(
    updateComSupplier,
    { onCompleted: () => recheck() }
  )
  const [createRule, { loading: rlLoading }] = useMutation(AutomationRuleCreate)

  const { status, component } = activeRow || ''
  const { name, version, suppliers } = component || ''

  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'

  const initialData = useMemo(
    () => ({
      name: '',
      url: '',
      contactName: '',
      contactEmail: ''
    }),
    []
  )
  const [formData, setFormData] = useState(initialData)
  const [isValidUrl, setIsValidUrl] = useState('')

  const isInvalid = formData?.url !== '' && !validateUrl(formData?.url)
  const isDisabled = isInvalid || formData?.name === ''

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const containsSpace = hasWhiteSpace(formData?.url)

  const data = {
    url: formData?.url,
    name: formData?.name,
    componentId: component?.id,
    contactName: formData?.contactName,
    contactEmail: formData?.contactEmail
  }

  const handleCheckUrl = () => {
    if (!validateUrl(formData?.url)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const conditionsAttributes = [
    {
      subject: 'component',
      operator: 'is',
      field: 'component_name',
      value: component?.name
    },
    {
      subject: 'component',
      operator: 'is',
      field: 'component_version',
      value: component?.version
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_supplier_name',
      value: undefined
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_supplier_url',
      value: undefined
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_supplier_contact_name',
      value: undefined
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_supplier_contact_email',
      value: undefined
    }
  ]

  const actionsAttributes = [
    {
      subject: 'component',
      field: 'component_supplier_name',
      value: formData?.name || undefined
    },
    {
      subject: 'component',
      field: 'component_supplier_url',
      value: formData?.url || undefined
    },
    {
      subject: 'component',
      field: 'component_supplier_contact_name',
      value: formData?.contactName || undefined
    },
    {
      subject: 'component',
      field: 'component_supplier_contact_email',
      value: formData?.contactEmail || undefined
    }
  ]

  const filterActions = actionsAttributes?.filter(
    (item) => item?.value !== undefined
  )

  const { AUTOMATION_RULES } = ProductDetailsTabs

  const link = generateProductDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: AUTOMATION_RULES
    }
  })

  const handleRuleCreate = async () => {
    if (ruleExists) {
      navigate(link)
    } else {
      const projectIds = selectedEnvironments?.map((option) => option.value)
      const mutationPromises = projectIds.map((id) =>
        createRule({
          variables: {
            active: true,
            name: shortDesc,
            projectId: id,
            checkComponent: name,
            checkVersion: version,
            checkIdentifier: friendlyId,
            automationConditionsAttributes: conditionsAttributes,
            automationActionsAttributes: filterActions
          }
        })
      )

      try {
        const results = await Promise.all(mutationPromises)
        const allErrors = results.flatMap(
          (res) => res?.data?.automationRuleCreate?.errors || []
        )

        if (allErrors.length > 0) {
          onClose()
          showToast({
            description: `Unable to create rule, please try again.`,
            status: 'error'
          })
        } else {
          showToast({
            description: 'Rule added successfully',
            status: 'success'
          })
        }
      } catch (error) {
        onClose()
        showToast({
          description: 'An unexpected error occurred while creating the rule.',
          status: 'error'
        })
      }
    }
  }

  const handleCreate = async (applyRule) => {
    try {
      const res = await createSupplier({ variables: data })
      if (res?.data?.compSupplierCreate?.errors?.length > 0) {
        setError(res?.data?.compSupplierCreate?.errors[0])
      } else {
        showToast({
          description: 'Supplier added successfully',
          status: 'success'
        })
      }

      if (applyRule) {
        await handleRuleCreate()
      }
    } finally {
      onClose()
    }
  }

  const handleUpdate = async (applyRule) => {
    try {
      const res = await updateSupplier({
        variables: {
          id: component?.suppliers[0].id,
          ...data
        }
      })
      if (res?.data?.compSupplierUpdate?.errors?.length > 0) {
        setError(res?.data?.compSupplierUpdate?.errors[0])
      } else {
        showToast({
          description: 'Supplier updated successfully',
          status: 'success'
        })
      }

      if (applyRule) {
        await handleRuleCreate()
      }
    } finally {
      onClose()
    }
  }

  const handleAutomation = async () => {
    if (resolved) {
      await handleRuleCreate().then(() => onClose())
    } else {
      component?.suppliers?.length > 0 ? handleUpdate(true) : handleCreate(true)
    }
  }

  const handleSubmit = () => {
    if (component?.suppliers?.length > 0) {
      handleUpdate(false)
    } else {
      handleCreate(false)
    }
  }

  const ActionBtn = () => (
    <Button
      mr={'auto'}
      fontSize={'sm'}
      variant='ghost'
      isLoading={rlLoading}
      isDisabled={isDisabled}
      loadingText='Loading...'
      onClick={handleAutomation}
      hidden={friendlyId ? false : true}
      colorScheme={ruleExists ? 'green' : 'blue'}
      title={`${ruleExists ? 'View' : 'Save as'} Rule`}
    >
      {ruleExists ? 'View' : 'Save as'} Rule
    </Button>
  )

  useEffect(() => {
    if (component?.suppliers?.length > 0) {
      setFormData(() => ({
        name: component?.suppliers[0]?.name || '',
        url: component?.suppliers[0]?.url || '',
        contactName: component?.suppliers[0]?.contactName || '',
        contactEmail: component?.suppliers[0]?.contactEmail || ''
      }))
    } else {
      setFormData(initialData)
    }
  }, [component, initialData])

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        Icon={LuContainer}
        disabled={isInvalid}
        title={`Add Supplier`}
        onSubmit={handleSubmit}
        hideCancelButton={rlLoading}
        hidden={resolved || rlLoading}
        isLoading={createLoading || updateLoading}
        leftFooterContent={!isFreeTier && <ActionBtn />}
        buttonText={suppliers?.length > 0 ? 'Update' : 'Save'}
      >
        <Stack mb={error || component ? 4 : 0}>
          {error !== '' && <LynkAlert msg={error} />}
          {component && <CompInfo data={component} />}
        </Stack>

        <Stack spacing={4}>
          {/* ORG NAME */}
          <FormControl isRequired isDisabled={resolved}>
            <FormLabel>Organization Name</FormLabel>
            <Input
              name='name'
              autoComplete='off'
              value={formData?.name}
              onChange={handleChange}
              placeholder='Enter organization name'
            />
          </FormControl>
          {/* ORG URL */}
          <FormControl
            isDisabled={resolved}
            isInvalid={isInvalid || containsSpace}
          >
            <FormLabel>URL</FormLabel>
            <Input
              name='url'
              autoComplete='off'
              value={formData?.url}
              onChange={handleChange}
              placeholder='Enter URL'
              onBlur={handleCheckUrl}
            />
            <FormErrorMessage>{isValidUrl}</FormErrorMessage>
          </FormControl>
          {/* SUPPLIER NAME */}
          <FormControl isDisabled={resolved}>
            <FormLabel>Contact Name</FormLabel>
            <Input
              minLength={4}
              maxLength={256}
              autoComplete='no'
              name='contactName'
              onChange={handleChange}
              value={formData?.contactName}
              placeholder='Enter supplier name'
            />
          </FormControl>
          {/* SUPPLIER EMAIL */}
          <FormControl isDisabled={resolved}>
            <FormLabel>Contact Email</FormLabel>
            <Input
              type='email'
              autoComplete='off'
              name='contactEmail'
              onChange={handleChange}
              value={formData?.contactEmail}
              placeholder='Enter supplier email'
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
    </>
  )
}

export default SupplierModal
