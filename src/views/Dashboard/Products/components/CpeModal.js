import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { validateCpe, validateFields, validateLanguage } from 'utils/cpeUtils'

import { InfoIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Grid, Tag } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import CpeField from 'components/CpeEditor/CpeField'
import Part from 'components/CpeEditor/Part'
import Product from 'components/CpeEditor/Product'
import TargetHardware from 'components/CpeEditor/TargetHardware'
import Vendor from 'components/CpeEditor/Vendor'
import Version from 'components/CpeEditor/Version'
import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { AutomationRuleCreate, UpdateComponent } from 'graphQL/Mutation'

const CpeModal = ({ isOpen, onClose, activeRow, ruleExists, recheck }) => {
  const { status, component } = activeRow || ''
  const { name: compName, version: compVersion, cpes } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'
  const params = useParams()
  const sbomId = params.sbomid
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()

  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const [value, setValue] = useState('cpe:2.3:*:*:*:*:*:*:*:*:*:*:*')
  const [cpeData, setCpeData] = useState({
    part: '',
    vendor: '',
    product: '',
    version: '',
    update: '',
    edition: '',
    language: '',
    swEdition: '',
    targetSoftware: '',
    targetHardware: '',
    other: ''
  })

  const isVendorValid = validateFields(cpeData?.vendor)
  const isProductValid = validateFields(cpeData?.product)
  const isUpdateValid = validateFields(cpeData?.update)
  const isEditionValid = validateFields(cpeData?.edition)
  const isLanguageValid = validateLanguage(cpeData?.language)
  const isSwEditionValid = validateFields(cpeData?.swEdition)
  const isTargetSoftWareValid = validateFields(cpeData?.targetSoftware)
  const isOtherFieldValid = validateFields(cpeData?.other)

  const [error, setError] = useState('')

  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const isInvalid =
    ['part', 'vendor', 'product', 'version'].some((key) => !cpeData?.[key]) ||
    !isLanguageValid ||
    !isEditionValid ||
    !isUpdateValid ||
    !isSwEditionValid ||
    !isTargetSoftWareValid ||
    !isOtherFieldValid ||
    !isVendorValid ||
    !isProductValid

  const [updateComponent, { loading }] = useMutation(UpdateComponent, {
    onCompleted: () => recheck()
  })

  const [createRule, { loading: ruleLoading }] =
    useMutation(AutomationRuleCreate)

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
      field: 'component_cpe',
      value: undefined
    }
  ]

  const filterConditions = conditionsAttributes?.filter(
    (item) => item?.field !== 'component_cpe'
  )

  const actionsAttributes = [
    {
      subject: 'component',
      field: 'component_cpe',
      value: value || ''
    }
  ]

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
            checkComponent: compName,
            checkVersion: compVersion,
            checkIdentifier: friendlyId,
            automationConditionsAttributes:
              shortDesc === 'Component has a cpe'
                ? conditionsAttributes
                : filterConditions,
            automationActionsAttributes: actionsAttributes
          }
        })
      )

      try {
        const results = await Promise.all(mutationPromises)
        const allErrors = results.flatMap(
          (res) => res?.data?.automationRuleCreate?.errors || []
        )

        if (allErrors.length > 0) {
          setError(allErrors[0])
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
        console.error('Error during rule creation:', error)
        showToast({
          description: 'An unexpected error occurred while creating the rule.',
          status: 'error'
        })
      }
    }
  }

  const updateCpeString = (index, val) => {
    const cpeParts = value?.split(':')
    cpeParts[index] = val === '' ? '*' : val
    const cpe = cpeParts.join(':')
    setValue(cpe)
  }

  const onChange = (field, value, index) => {
    updateCpeString(index, value)
    setCpeData((prev) => ({ ...prev, [field]: value }))
  }

  // ON CPE UPDATE
  const handleUpdate = async (applyRule) => {
    try {
      if (validateCpe(value)) {
        const res = await updateComponent({
          variables: {
            id: component?.id,
            sbomId: sbomId,
            cpes: [value]
          }
        })

        if (res?.data?.componentUpdate?.errors?.length > 0) {
          setError(res?.data?.componentUpdate?.errors[0])
        } else {
          showToast({
            description: 'Component updated successfully',
            status: 'success'
          })
        }

        if (applyRule) {
          await handleRuleCreate()
        }
      } else {
        setError('Invalid CPE')
      }
    } finally {
      onClose()
    }
  }

  const handleAutomation = async () => {
    if (resolved) {
      await handleRuleCreate().then(() => onClose())
    } else {
      handleUpdate(true)
    }
  }

  const handleSubmit = () => handleUpdate(false)

  const ActionBtn = () => (
    <Button
      mr={'auto'}
      fontSize={'sm'}
      variant='ghost'
      isDisabled={isInvalid}
      isLoading={ruleLoading}
      loadingText='Loading...'
      onClick={handleAutomation}
      hidden={friendlyId ? false : true}
      colorScheme={ruleExists ? 'green' : 'blue'}
      title={`${ruleExists ? 'View' : 'Save as'} Rule`}
    >
      {ruleExists ? 'View' : 'Save as'} Rule
    </Button>
  )

  // UPDATE FIELDS DATA FROM API
  useEffect(() => {
    if (cpes?.length > 0) {
      setValue(cpes[0])
      if (validateCpe(cpes[0])) {
        const allowedValues = ['a', 'h', 'o', 'A', 'H', 'O']
        const components = cpes[0]?.split(':')
        const isValid =
          components[2] && allowedValues.includes(components[2].toLowerCase())
        setCpeData((prev) => ({
          ...prev,
          part: isValid ? components[2].toLowerCase() : '',
          vendor: components[3]?.replace(/\*/g, '') || '',
          product: components[4]?.replace(/\*/g, '') || '',
          version: components[5]?.replace(/\*/g, '') || '',
          update: components[6]?.replace(/\*/g, '') || '',
          edition: components[7]?.replace(/\*/g, '') || '',
          language: components[8]?.replace(/\*/g, '') || '',
          swEdition: components[9]?.replace(/\*/g, '') || '',
          targetSoftware: components[10]?.replace(/\*/g, '') || '',
          targetHardware: components[11]?.replace(/\*/g, '') || '',
          other: components[12]?.replace(/\*/g, '') || ''
        }))
      } else {
        setError('Invalid CPE')
      }
    }
  }, [cpes])

  return (
    <>
      <LynkModal
        Icon={InfoIcon}
        isOpen={isOpen}
        onClose={onClose}
        isLoading={loading}
        buttonText={'Save'}
        disabled={isInvalid}
        title={'CPE Details'}
        onSubmit={handleSubmit}
        hideCancelButton={ruleLoading}
        hidden={status === 'resolved' || ruleLoading}
        leftFooterContent={!isFreeTier && <ActionBtn />}
      >
        {component && (
          <Box mb={4}>
            <CompInfo data={component} />
          </Box>
        )}
        <Flex width={'100%'} direction={'column'} gap={4}>
          {error !== '' && <LynkAlert msg={error} />}
          {/* CPE STRING */}
          <FormControl isReadOnly>
            <FormLabel htmlFor='cpe'>CPE String</FormLabel>
            <Tag py={2} w={'fit-content'}>
              {value}
            </Tag>
          </FormControl>
          <Grid templateColumns='repeat(2, 1fr)' gap={6}>
            {/* PART */}
            <Part
              disabled={resolved}
              part={cpeData?.part}
              onChange={onChange}
            />
            {/* VENDOR */}
            <Vendor
              disabled={resolved}
              vendor={cpeData?.vendor}
              onChange={onChange}
              isValid={isVendorValid}
            />
            {/* PRODUCT */}
            <Product
              disabled={resolved}
              product={cpeData?.product}
              onChange={onChange}
              isValid={isProductValid}
            />
            {/* VERSION */}
            <Version
              disabled={resolved}
              version={cpeData?.version}
              onChange={onChange}
            />
            {/* UPDATE */}
            <CpeField
              label='Update'
              name='update'
              value={cpeData?.update}
              onChange={onChange}
              isValid={isUpdateValid}
              disabled={resolved}
              index={6}
            />
            {/* EDITION */}
            <CpeField
              label='Edition'
              name='edition'
              value={cpeData?.edition}
              onChange={onChange}
              isValid={isEditionValid}
              disabled={resolved}
              index={7}
            />
            {/* LANGUAGE */}
            <CpeField
              label='Language'
              name='language'
              value={cpeData?.language}
              onChange={onChange}
              isValid={isLanguageValid}
              disabled={resolved}
              index={8}
            />
            {/* SW EDITION */}
            <CpeField
              label='SW Edition'
              name='swEdition'
              value={cpeData?.swEdition}
              onChange={onChange}
              isValid={isSwEditionValid}
              disabled={resolved}
              index={9}
            />
            {/* TARGET SOFTWARE */}
            <CpeField
              label='Target Software'
              name='targetSoftware'
              value={cpeData?.targetSoftware}
              onChange={onChange}
              isValid={isTargetSoftWareValid}
              disabled={resolved}
              index={10}
            />
            {/* TARGET HARDWARE */}
            <TargetHardware
              disabled={resolved}
              targetHardware={cpeData?.targetHardware}
              onChange={onChange}
            />
            {/* OTHERE */}
            <CpeField
              label='Other'
              name='other'
              value={cpeData?.other}
              onChange={onChange}
              isValid={isOtherFieldValid}
              disabled={resolved}
              index={12}
            />
          </Grid>
          {!ruleExists && (
            <EnvironmentSelector
              fixed={resolved}
              ruleExists={ruleExists}
              environments={selectedEnvironments}
              setEnvironments={setSelectedEnvironments}
            />
          )}
        </Flex>
      </LynkModal>
    </>
  )
}

export default CpeModal
