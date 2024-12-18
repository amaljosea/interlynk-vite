import { useMutation } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { Box, Button, Flex } from '@chakra-ui/react'
import { FormControl, Textarea } from '@chakra-ui/react'

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

import { FaCircleInfo } from 'react-icons/fa6'

const PurlModal = ({ isOpen, onClose, activeRow, ruleExists, recheck }) => {
  const { status, component } = activeRow || ''
  const { name, version, purl } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'
  const { isFreeTier } = useGlobalQueryContext()

  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const navigate = useNavigate()
  const { showToast } = useCustomToast()

  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  console.log(purl)

  const [value, setValue] = useState('pkg:type/name@version')

  const [error, setError] = useState('')
  const [purlData, setPurlData] = useState({
    type: '',
    namespace: '',
    name: '',
    version: '',
    qualifiers: ''
  })

  const isInvalid =
    ['name', 'type'].some((key) => !purlData?.[key]) ||
    (purlData?.type === 'swift' && !purlData?.namespace)

  const [updateComponent, { loading }] = useMutation(UpdateComponent, {
    onCompleted: () => recheck()
  })

  const onChange = (field, value) => {
    const filterValue = value?.replace(/\s/g, '')
    setError('')
    setPurlData((prev) => ({ ...prev, [field]: filterValue }))
  }

  const onBlur = (field, val) => {
    try {
      const pkg = PackageURL.fromString(value)
      if (field === 'qualifiers') {
        const convertedObject = {}
        const params = new URLSearchParams(val)
        for (const [key, value] of params) {
          convertedObject[key] = value
        }
        pkg[field] = convertedObject
        setValue(pkg.toString())
      } else {
        pkg[field] = val !== '' ? val : field
        setValue(pkg.toString())
      }
    } catch (error) {
      console.log('Something went wrong', error)
    }
  }

  const handleComUpdate = () => {
    if (resolved) {
      onClose()
    } else {
      updateComponent({
        variables: {
          id: component?.id,
          sbomId: sbomId,
          purl: value
        }
      }).then((res) => res?.data && onClose())
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
      value: value
    }
  ]

  const { AUTOMATION_RULES } = ProductDetailsTabs

  const link = generateProductDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: AUTOMATION_RULES
    }
  })

  const handleRuleCreate = () => {
    if (ruleExists) {
      navigate(link)
    } else {
      createRule({
        variables: {
          active: true,
          name: shortDesc,
          projectId: productId,
          checkComponent: name,
          checkVersion: version,
          checkIdentifier: friendlyId,
          automationConditionsAttributes:
            shortDesc === 'Component has a purl'
              ? conditionsAttributes
              : filterConditions,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          showToast({
            description: `Unable to create rule, please try again.`,
            status: 'error'
          })
        } else {
          handleComUpdate()
          showToast({
            description: 'Rule added successfully',
            status: 'success'
          })
        }
      })
    }
  }

  const ActionBtn = () => (
    <Button
      variant='ghost'
      mr={'auto'}
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

  useEffect(() => {
    if (purl) {
      setValue(purl)
      try {
        const data = PackageURL.fromString(purl)
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
        setError(error?.message)
      }
    }
  }, [purl])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      hidden={resolved}
      buttonText={'Save'}
      Icon={FaCircleInfo}
      title={'PURL Details'}
      onSubmit={handleComUpdate}
      disabled={isInvalid || loading}
      leftFooterContent={!isFreeTier && <ActionBtn />}
    >
      {component && (
        <Box mb={4}>
          <CompInfo data={component} />
        </Box>
      )}
      <Flex width={'100%'} direction={'column'} gap={4}>
        {error && <LynkAlert msg={error} />}
        {/* Package URL */}
        <FormControl isReadOnly>
          <Textarea
            type='text'
            value={value}
            fontSize='sm'
            variant='filled'
            onChange={(e) => console.log(e.target.value)}
          />
        </FormControl>
        {/* Type */}
        <PackageType
          onBlur={onBlur}
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
      </Flex>
    </LynkModal>
  )
}

export default PurlModal
