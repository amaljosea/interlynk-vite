import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { validateCpe } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { InfoIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Grid, Textarea } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import Edition from 'components/CpeEditor/Edition'
import Language from 'components/CpeEditor/Language'
import Other from 'components/CpeEditor/Other'
import Part from 'components/CpeEditor/Part'
import Product from 'components/CpeEditor/Product'
import SwEdition from 'components/CpeEditor/SwEdition'
import TargetHardware from 'components/CpeEditor/TargetHardware'
import TargetSoftware from 'components/CpeEditor/TargetSoftware'
import Update from 'components/CpeEditor/Update'
import Vendor from 'components/CpeEditor/Vendor'
import Version from 'components/CpeEditor/Version'
import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'

import { AutomationRuleCreate, UpdateComponent } from 'graphQL/Mutation'

const CpeModal = ({ isOpen, onClose, activeRow, ruleExists, recheck }) => {
  const { status, component } = activeRow || ''
  const { name: compName, version: compVersion, cpes } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()

  const [options, setOptions] = useState([])
  const [defaultEnv, setDefaultEnv] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const { projects, loading: envLoading } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

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

  const [error, setError] = useState('')

  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const isInvalid = ['part', 'vendor', 'product', 'version'].some(
    (key) => !cpeData?.[key]
  )

  const [updateComponent, { loading }] = useMutation(UpdateComponent, {
    onCompleted: () => recheck()
  })

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

  // ON CPE UPDATE
  const handleComUpdate = () => {
    if (resolved) {
      onClose()
    } else {
      if (validateCpe(value)) {
        updateComponent({
          variables: {
            id: component?.id,
            sbomId: sbomId,
            cpes: [value]
          }
        }).then((res) => res?.data && onClose())
      } else {
        setError('Invalid CPE')
      }
    }
  }

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
          handleComUpdate()
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

  const onChange = (field, value) => {
    setCpeData((prev) => ({ ...prev, [field]: value }))
  }

  const onBlur = (index, val) => {
    const cpeParts = value?.split(':')
    cpeParts[index] = val === '' ? '*' : val
    const cpe = cpeParts.join(':')
    setValue(cpe)
  }

  const ActionBtn = () => (
    <Button
      mr={'auto'}
      variant='ghost'
      fontSize={'sm'}
      onClick={handleRuleCreate}
      hidden={friendlyId ? false : true}
      isLoading={ruleLoading || loading}
      colorScheme={ruleExists ? 'green' : 'blue'}
      title={`${ruleExists ? 'View' : 'Save as'} Rule`}
      isDisabled={ruleLoading || loading || isInvalid}
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
        buttonText={'Save'}
        title={'CPE Details'}
        onSubmit={handleComUpdate}
        hidden={status === 'resolved'}
        disabled={loading || isInvalid}
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
            <Textarea
              type='text'
              fontSize='sm'
              variant='filled'
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormControl>
          <Grid templateColumns='repeat(2, 1fr)' gap={6}>
            {/* PART */}
            <Part
              disabled={resolved}
              part={cpeData?.part}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* VENDOR */}
            <Vendor
              disabled={resolved}
              vendor={cpeData?.vendor}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* PRODUCT */}
            <Product
              disabled={resolved}
              product={cpeData?.product}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* VERSION */}
            <Version
              disabled={resolved}
              version={cpeData?.version}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* UPDATE */}
            <Update
              disabled={resolved}
              update={cpeData?.update}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* EDITION */}
            <Edition
              disabled={resolved}
              edition={cpeData?.edition}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* LANGUAGE */}
            <Language
              disabled={resolved}
              language={cpeData?.language}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* SW EDITION */}
            <SwEdition
              disabled={resolved}
              swEdition={cpeData?.swEdition}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* TARGET SOFTWARE */}
            <TargetSoftware
              disabled={resolved}
              targetSoftware={cpeData?.targetSoftware}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* TARGET HARDWARE */}
            <TargetHardware
              disabled={resolved}
              targetHardware={cpeData?.targetHardware}
              onBlur={onBlur}
              onChange={onChange}
            />
            {/* OTHERE */}
            <Other
              disabled={resolved}
              other={cpeData?.other}
              onBlur={onBlur}
              onChange={onChange}
            />
          </Grid>
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

export default CpeModal
