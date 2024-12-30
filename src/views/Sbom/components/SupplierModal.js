import { useMutation } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { hasWhiteSpace, validateUrl } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { Box, Button, Flex, Input } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkModal from 'components/LynkModal'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'

import { AutomationRuleCreate, addComSupplier } from 'graphQL/Mutation'
import { updateComSupplier } from 'graphQL/Mutation'

import { BiCube } from 'react-icons/bi'

const SupplierModal = (props) => {
  const { isOpen, onClose, activeRow, ruleExists, recheck } = props

  const params = useParams()
  const productId = params.productid
  const navigate = useNavigate()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { showToast } = useCustomToast()
  const [options, setOptions] = useState([])
  const [defaultEnv, setDefaultEnv] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const { projects, loading: envLoading } = useProjectGroup({
    projectGroupId: params.productgroupid
  })
  const [createSupplier, { loading: createLoading }] = useMutation(
    addComSupplier,
    {
      onCompleted: () => recheck()
    }
  )
  const [updateSupplier, { loading: updateLoading }] = useMutation(
    updateComSupplier,
    {
      onCompleted: () => recheck()
    }
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const containsSpace = hasWhiteSpace(formData?.url)

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

  useEffect(() => {
    const defaultOption = projects.find((project) => project.id === productId)
    if (defaultOption) {
      const defaultEnvObj = {
        value: defaultOption.id,
        label: defaultOption.name
      }
      setDefaultEnv(defaultEnvObj)
      setSelectedEnvironments([defaultEnvObj])
    }

    const otherOptions = projects
      .filter((project) => project.id !== productId)
      .map((project) => ({
        value: project.id,
        label: project.name
      }))
    setOptions(otherOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envLoading])

  const handleSave = () => {
    const data = {
      url: formData?.url,
      name: formData?.name,
      componentId: component?.id,
      contactName: formData?.contactName,
      contactEmail: formData?.contactEmail
    }
    if (component?.suppliers?.length > 0) {
      updateSupplier({
        variables: {
          id: component?.suppliers[0].id,
          ...data
        }
      }).finally(() => onClose())
    } else {
      createSupplier({ variables: data }).finally(() => onClose())
    }
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
          if (component?.suppliers?.length > 0) {
            onClose()
          } else {
            handleSave()
          }
          showToast({
            description: 'Rule added successfully',
            status: 'success'
          })
        }
      } catch (error) {
        console.error('Error during rule creation:', error)
        onClose()
        showToast({
          description: 'An unexpected error occurred while creating the rule.',
          status: 'error'
        })
      }
    }
  }

  const isInvalid = formData?.url !== '' && !validateUrl(formData?.url)
  const disabled =
    isInvalid || formData?.name === '' || createLoading || updateLoading

  const ActionBtn = () => (
    <Button
      mr={'auto'}
      variant='ghost'
      fontSize={'sm'}
      isDisabled={disabled}
      onClick={handleRuleCreate}
      hidden={friendlyId ? false : true}
      colorScheme={ruleExists ? 'green' : 'blue'}
      title={`${ruleExists ? 'View' : 'Save as'} Rule`}
      isLoading={rlLoading || createLoading || updateLoading}
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
        Icon={BiCube}
        isOpen={isOpen}
        hidden={resolved}
        onClose={onClose}
        onSubmit={handleSave}
        title={`Add Supplier`}
        leftFooterContent={!isFreeTier && <ActionBtn />}
        disabled={isInvalid || createLoading || updateLoading}
        buttonText={suppliers?.length > 0 ? 'Update' : 'Save'}
      >
        {component && (
          <Box mb={4}>
            <CompInfo data={component} />
          </Box>
        )}
        <Flex width={'100%'} direction={'column'} gap={4}>
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
              ruleExists={ruleExists}
              envLoading={envLoading}
              defaultEnv={defaultEnv}
              options={options}
              selectedEnvironments={selectedEnvironments}
              handleCheckboxChange={handleCheckboxChange}
            />
          )}
        </Flex>
      </LynkModal>
    </>
  )
}

export default SupplierModal
