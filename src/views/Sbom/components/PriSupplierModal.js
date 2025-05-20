import { useMutation } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'

import { Button, Input, Stack } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import {
  AutomationRuleCreate,
  supplierCreate,
  supplierUpdate
} from 'graphQL/Mutation'

import { LuContainer } from 'react-icons/lu'

const PriSupplierModal = (props) => {
  const { isOpen, onClose, activeRow, ruleExists, recheck } = props

  const params = useParams()
  const sbomId = params.sbomid
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const { status } = activeRow || ''
  const resolved = status === 'resolved'
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''

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
  const [error, setError] = useState('')

  const data = activeRow?.sbom ? activeRow?.sbom?.suppliers : activeRow

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const containsSpace = hasWhiteSpace(formData?.url)

  const handleCheckUrl = () => {
    if (!validateUrl(formData?.url)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const isInvalid = formData?.url !== '' && !validateUrl(formData?.url)

  const [createSupplier, { loading: crLoading }] = useMutation(supplierCreate, {
    onCompleted: () => (friendlyId ? recheck() : null)
  })
  const [updateSupplier, { loading: upLoading }] = useMutation(supplierUpdate, {
    onCompleted: () => (friendlyId ? recheck() : null)
  })

  const [createRule, { loading: rlLoading }] = useMutation(AutomationRuleCreate)

  const conditionsAttributes = [
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_supplier_name',
      value: undefined
    },
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_supplier_url',
      value: undefined
    },
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_supplier_contact_name',
      value: undefined
    },
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_supplier_contact_email',
      value: undefined
    }
  ]

  const actionsAttributes = [
    {
      subject: 'version',
      field: 'version_supplier_name',
      value: formData?.name || undefined
    },
    {
      subject: 'version',
      field: 'version_supplier_url',
      value: formData?.url || undefined
    },
    {
      subject: 'version',
      field: 'version_supplier_contact_name',
      value: formData?.contactName || undefined
    },
    {
      subject: 'version',
      field: 'version_supplier_contact_email',
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
          showToast({
            description: `Unable to create rule for one or more projects. Please try again.`,
            status: 'error'
          })
        } else {
          showToast({
            description: 'Rule added successfully for all selected projects.',
            status: 'success'
          })
        }
      } catch (error) {
        showToast({
          description: 'An unexpected error occurred while creating the rule.',
          status: 'error'
        })
      }
    }
  }

  const handleCreate = async (applyRule) => {
    try {
      const res = await createSupplier({
        variables: {
          sbomId: sbomId,
          url: formData?.url,
          name: formData?.name,
          contactName: formData?.contactName,
          contactEmail: formData?.contactEmail
        }
      })
      if (res?.data?.sbomSupplierCreate?.errors?.length > 0) {
        setError(res?.data?.sbomSupplierCreate?.errors[0])
      } else {
        showToast({
          description: 'Supplier addedd successfully',
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
          url: formData?.url,
          name: formData?.name,
          contactName: formData?.contactName,
          contactEmail: formData?.contactEmail,
          id: data?.length > 0 && data[0].id
        }
      })
      if (res?.data?.sbomSupplierUpdate?.errors?.length > 0) {
        setError(res?.data?.sbomSupplierUpdate?.errors[0])
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

  const handleSubmit = () => {
    if (hasSuppliers) {
      handleUpdate(false)
    } else {
      handleCreate(false)
    }
  }

  const handleAutomation = async () => {
    if (resolved) {
      await handleRuleCreate().then(() => onClose())
    } else {
      hasSuppliers ? handleUpdate(true) : handleCreate(true)
    }
  }

  const RuleAction = () => (
    <Button
      mr={'auto'}
      fontSize={'sm'}
      variant='ghost'
      isLoading={rlLoading}
      loadingText='Loading...'
      onClick={handleAutomation}
      hidden={friendlyId ? false : true}
      isDisabled={isInvalid || !formData?.name}
      colorScheme={ruleExists ? 'green' : 'blue'}
      title={`${ruleExists ? 'View' : 'Save as'} Rule`}
    >
      {ruleExists ? 'View' : 'Save as'} Rule
    </Button>
  )

  useEffect(() => {
    if (data?.length > 0) {
      setFormData(() => ({
        name: data[0]?.name || '',
        url: data[0]?.url || '',
        contactName: data[0]?.contactName || '',
        contactEmail: data[0]?.contactEmail || ''
      }))
    } else {
      setFormData(initialData)
    }
  }, [data, initialData])

  const hasSuppliers = data?.length > 0

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        Icon={LuContainer}
        disabled={isInvalid}
        onSubmit={handleSubmit}
        hideCancelButton={rlLoading}
        hidden={resolved || rlLoading}
        isLoading={crLoading || upLoading}
        buttonText={hasSuppliers ? 'Update' : 'Save'}
        leftFooterContent={!isFreeTier && <RuleAction />}
        title={`${hasSuppliers ? 'Update' : 'Add'} ${friendlyId ? 'SBOM' : ''} Supplier`}
      >
        {error !== '' && <LynkAlert msg={error} />}

        <Stack spacing={4}>
          {/* ORG NAME */}
          <FormControl isRequired isDisabled={resolved}>
            <FormLabel>Organization Name</FormLabel>
            <Input
              name='name'
              autoComplete='off'
              onChange={handleChange}
              value={formData?.name}
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
              onChange={handleChange}
              placeholder='Enter URL'
              onBlur={handleCheckUrl}
              value={formData?.url}
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

export default PriSupplierModal
