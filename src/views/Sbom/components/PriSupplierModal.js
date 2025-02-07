import { useMutation } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'

import { supplierCreate, supplierUpdate } from 'graphQL/Mutation'
import { AutomationRuleCreate } from 'graphQL/Mutation'

import { BiShieldPlus } from 'react-icons/bi'

const PriSupplierModal = (props) => {
  const { isOpen, onClose, activeRow, ruleExists, recheck } = props

  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const [options, setOptions] = useState([])
  const [defaultEnv, setDefaultEnv] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const { projects, loading: envLoading } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

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

  const data = activeRow?.sbom ? activeRow?.sbom?.suppliers : activeRow

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

  const handleSave = () => {
    if (resolved) {
      onClose()
    } else {
      createSupplier({
        variables: {
          sbomId: sbomId,
          url: formData?.url,
          name: formData?.name,
          contactName: formData?.contactName,
          contactEmail: formData?.contactEmail
        }
      }).then((res) => {
        if (res?.data) {
          showToast({
            description: 'Supplier added successfully',
            status: 'success'
          })
          onClose()
        }
      })
    }
  }

  const handleUpdate = () => {
    updateSupplier({
      variables: {
        url: formData?.url,
        name: formData?.name,
        contactName: formData?.contactName,
        contactEmail: formData?.contactEmail,
        id: data?.length > 0 && data[0].id
      }
    }).then((res) => {
      if (res?.data) {
        showToast({
          description: 'Supplier updated successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

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
          handleSave()
          showToast({
            description: 'Rule added successfully for all selected projects.',
            status: 'success'
          })
        }
      } catch (error) {
        console.error('Error during rule creation:', error)
        showToast({
          description: 'An unexpected error occurred while creating the rule.',
          status: 'error'
        })
      }
    }
  }

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
        hidden={resolved}
        Icon={BiShieldPlus}
        disabled={isInvalid || crLoading || upLoading}
        title={`${hasSuppliers ? 'Update' : 'Add'} ${friendlyId ? 'SBOM' : ''} Supplier`}
        buttonText={hasSuppliers ? 'Update' : 'Save'}
        onSubmit={hasSuppliers ? handleUpdate : handleSave}
        leftFooterContent={
          !isFreeTier && (
            <Button
              mr={'auto'}
              fontSize={'sm'}
              variant='ghost'
              onClick={handleRuleCreate}
              hidden={friendlyId ? false : true}
              colorScheme={ruleExists ? 'green' : 'blue'}
              isLoading={rlLoading || crLoading || upLoading}
              title={`${ruleExists ? 'View' : 'Save as'} Rule`}
              isDisabled={
                isInvalid || crLoading || upLoading || !formData?.name
              }
            >
              {ruleExists ? 'View' : 'Save as'} Rule
            </Button>
          )
        }
      >
        <Flex width={'100%'} direction={'column'} gap={4}>
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
              ruleExists={ruleExists}
              envLoading={envLoading}
              defaultEnv={defaultEnv}
              options={options}
              selectedEnvironments={selectedEnvironments}
              handleCheckboxChange={handleCheckboxChange}
              fixed={resolved}
            />
          )}
        </Flex>
      </LynkModal>
    </>
  )
}

export default PriSupplierModal
