import { useMutation } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { Button, Stack, Tag } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import CompInfo from 'components/Misc/CompInfo'
import Name from 'components/PurlEditor/Name'
import Namespace from 'components/PurlEditor/Namespace'
import PackageType from 'components/PurlEditor/PackageType'
import Qualifiers from 'components/PurlEditor/Qualifiers'
import Version from 'components/PurlEditor/Version'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { AutomationRuleCreate, UpdateComponent } from 'graphQL/Mutation'

import { LuInfo } from 'react-icons/lu'

const PurlModal = ({ isOpen, onClose, activeRow, ruleExists, recheck }) => {
  const { status, component } = activeRow || ''
  const { name, version, purl } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'
  const { isFreeTier } = useGlobalQueryContext()

  const params = useParams()
  const sbomId = params.sbomid
  const navigate = useNavigate()
  const { showToast } = useCustomToast()

  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const [error, setError] = useState('')
  const [purlData, setPurlData] = useState({
    type: '',
    namespace: '',
    name: '',
    version: '',
    qualifiers: ''
  })

  const TYPE = purlData?.type || ``
  const NAMESPACE = purlData?.namespace ? `/${purlData?.namespace}` : ``
  const NAME = purlData?.name ? `/${purlData?.name}` : ``
  const VERSION = purlData?.version ? `@${purlData?.version}` : ``
  const QUALIFIERS = purlData?.qualifiers ? `?${purlData?.qualifiers}` : ``
  const PURL_STRING = `pkg:${TYPE}${NAMESPACE}${NAME}${VERSION}${QUALIFIERS}`

  const isInvalid =
    ['name', 'type'].some((key) => !purlData?.[key]) ||
    (purlData?.type === 'swift' && !purlData?.namespace)

  const [updateComponent, { loading }] = useMutation(UpdateComponent, {
    onCompleted: () => recheck()
  })

  const onChange = (name, value) => {
    setError('')
    setPurlData((prev) => ({
      ...prev,
      [name]: value || ''
    }))
  }

  const onBlur = (field, inputValue) => {
    setPurlData((prev) => ({
      ...prev,
      [field]: inputValue || ''
    }))
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
      field: 'component_purl',
      value: undefined
    }
  ]

  const filterConditions = conditionsAttributes?.filter(
    (item) => item?.field !== 'component_purl'
  )

  const actionsAttributes = [
    {
      subject: 'component',
      field: 'component_purl',
      value: PURL_STRING
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
            checkComponent: name,
            checkVersion: version,
            checkIdentifier: friendlyId,
            automationConditionsAttributes:
              shortDesc === 'Component has a purl'
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
        showToast({
          description: 'An unexpected error occurred while creating the rule.',
          status: 'error'
        })
      }
    }
  }

  const handleUpdate = async (applyRule) => {
    try {
      const res = await updateComponent({
        variables: {
          purl: PURL_STRING,
          sbomId: sbomId,
          id: component?.id
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
      loadingText='Loading...'
      isLoading={ruleLoading}
      onClick={handleAutomation}
      hidden={friendlyId ? false : true}
      colorScheme={ruleExists ? 'green' : 'blue'}
      title={`${ruleExists ? 'View' : 'Save as'} Rule`}
      isDisabled={ruleLoading || loading || isInvalid}
    >
      {ruleExists ? 'View' : 'Save as'} Rule
    </Button>
  )

  useEffect(() => {
    if (purl) {
      try {
        const data = PackageURL.fromString(decodeURI(purl))
        setPurlData((prev) => ({
          ...prev,
          type: data?.type || '',
          namespace: data?.namespace || '',
          name: data?.name || '',
          version: data?.version || '',
          qualifiers: data?.qualifiers
            ? Object.entries(data.qualifiers)
                .map(([key, value]) => `${key}=${value}`)
                .join('&')
            : ''
        }))
      } catch (error) {
        console.warn('Error', error)
      }
    }
  }, [purl])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      buttonText={'Save'}
      Icon={LuInfo}
      isLoading={loading}
      disabled={isInvalid}
      title={'PURL Details'}
      onSubmit={handleSubmit}
      hideCancelButton={ruleLoading}
      hidden={resolved || ruleLoading}
      leftFooterContent={!isFreeTier && <ActionBtn />}
    >
      <Stack mb={error || component ? 4 : 0}>
        {error !== '' && <LynkAlert msg={error} />}
        {component && <CompInfo data={component} />}
      </Stack>

      <Stack spacing={4}>
        {/* Package URL */}
        {purlData?.type && (
          <Tag mt={2} py={2} w={'fit-content'} wordBreak={'break-all'}>
            {PURL_STRING}
          </Tag>
        )}
        {/* Type */}
        <PackageType
          onChange={onChange}
          disabled={resolved}
          type={purlData?.type}
        />
        {/* Namespace */}
        <Namespace
          onBlur={onBlur}
          onChange={onChange}
          disabled={resolved}
          type={purlData?.type}
          namespace={purlData?.namespace}
        />
        {/* Name */}
        <Name
          onBlur={onBlur}
          onChange={onChange}
          disabled={resolved}
          type={purlData?.type}
          name={purlData?.name}
        />
        {/* Version */}
        <Version
          onBlur={onBlur}
          onChange={onChange}
          disabled={resolved}
          type={purlData?.type}
          version={purlData?.version}
        />
        {/* Qualifiers */}
        <Qualifiers
          onBlur={onBlur}
          onChange={onChange}
          disabled={resolved}
          qualifiers={purlData?.qualifiers}
        />
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

export default PurlModal
