import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { validateCpe } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { InfoIcon } from '@chakra-ui/icons'
import { Button, Flex, Grid, Tag, Text, Textarea } from '@chakra-ui/react'
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
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

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
  const productId = params.productid
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()

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

  const handleRuleCreate = () => {
    if (ruleExists) {
      navigate(link)
    } else {
      createRule({
        variables: {
          active: true,
          name: shortDesc,
          projectId: productId,
          checkComponent: compName,
          checkVersion: compVersion,
          checkIdentifier: friendlyId,
          automationConditionsAttributes:
            shortDesc === 'Component has a cpe'
              ? conditionsAttributes
              : filterConditions,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
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

  const onChange = (field, value) => {
    setCpeData((prev) => ({ ...prev, [field]: value }))
  }

  const onBlur = (index, val) => {
    const cpeParts = value?.split(':')
    cpeParts[index] = val === '' ? '*' : val
    const cpe = cpeParts.join(':')
    setValue(cpe)
  }

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
        title={'CPE Details'}
        onSubmit={handleComUpdate}
        disabled={isInvalid || loading}
        hidden={status === 'resolved'}
        buttonText={'Save'}
        leftFooterContent={
          !isFreeTier && (
            <Button
              variant='ghost'
              mr={'auto'}
              fontSize={'sm'}
              onClick={handleRuleCreate}
              hidden={friendlyId ? false : true}
              isLoading={ruleLoading || loading}
              title={`${ruleExists ? 'View' : 'Save as'} Rule`}
              isDisabled={ruleLoading || loading || isInvalid}
              colorScheme={ruleExists ? 'green' : 'blue'}
            >
              {ruleExists ? 'View' : 'Save as'} Rule
            </Button>
          )
        }
      >
        {component && (
          <Flex
            width='100%'
            direction={'row'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            wrap={'wrap'}
            gap={2}
            mb={6}
          >
            <Text wordBreak={'break-all'}>{component?.name || ''}</Text>
            <Tag colorScheme='blue'>{component?.version || '-'}</Tag>
          </Flex>
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
        </Flex>
      </LynkModal>
    </>
  )
}

export default CpeModal
