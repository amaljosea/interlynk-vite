import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import React, { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSignedUrlParams, transformLicenseString } from 'utils'
import { componentTypes, infoData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import { useDisclosure } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'
import { Flex, Stack, Text, Tooltip } from '@chakra-ui/react'
import { Checkbox, Input, Textarea } from '@chakra-ui/react'

import CpeEditor from 'components/CpeEditor'
import CpeField from 'components/CpeField'
import DividerWithText from 'components/DividerWithText'
import LicenseField from 'components/Licenses/LicenseField'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'
import CompInfo from 'components/Misc/CompInfo'
import LynkFormLabel from 'components/Misc/LynkLabel'
import PrimaryWarning from 'components/Modal/PrimaryWarning'
import PackageLookup from 'components/PackageLookup'
import PurlEditor from 'components/PurlEditor'
import PurlField from 'components/PurlField'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateCompRelation, CreateComponent } from 'graphQL/Mutation'
import { GetAllComponents } from 'graphQL/Queries'

import { LuComponent, LuMessageCircleWarning } from 'react-icons/lu'

function ComponentAddModal(props) {
  const navigate = useNavigate()
  const activeTab = useQueryParam('tab')
  const { showToast } = useCustomToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const signedUrlParams = getSignedUrlParams()
  const { isCustomerView } = useRouteFlags()

  const { tabData, handleChange, resetData, setTabData } =
    useContext(TabContext)
  const { details, identifiers, relationships } = tabData || ''

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const link = generateProductVersionDetailPageUrlFromCurrentUrl({
    replaceParams: true,
    paramsObj: {
      tab: activeTab
    }
  })

  const { primaryErrorColor, primaryBlueText, headingTextColor } =
    useThemeColor(['primaryErrorColor', 'primaryBlueText', 'headingTextColor'])

  const { isOpen, onClose, data, primaryComp, shortDesc } = props
  const { prodCompState, dispatch } = useGlobalState()
  const { purlString, totalComp } = prodCompState
  const { prodCompDispatch } = dispatch

  const [addRelation] = useMutation(CreateCompRelation)

  const [createComponent, { loading }] = useMutation(CreateComponent, {
    refetchQueries: ['GetComponentColumnData']
  })

  const [allComponents, setAllComponents] = useState([])
  const [showPurl, setShowPurl] = useState(false)
  const [showCpe, setShowCpe] = useState(false)
  const [purlValue, setPurlValue] = useState('')
  const [cpeValue, setCpeValue] = useState('')

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)
  const [isValidDate, setIsValidDate] = useState(true)

  const scopeOptions = [
    { value: '', label: '-- Select --' },
    { value: 'excluded', label: 'Excluded' },
    { value: 'optional', label: 'Optional' },
    { value: 'required', label: 'Required' }
  ]

  const supportLevels = [
    { value: '', label: '-- Select --' },
    { value: 'UNSPECIFIED', label: 'Unspecified' },
    { value: 'ACTIVELY_MAINTAINED', label: 'Actively Maintained' },
    { value: 'NO_LONGER_MAINTAINED', label: 'No Longer Maintained' },
    { value: 'ABANDONED', label: 'Abandoned' }
  ]

  const relationshipTypes = [
    { value: '', label: '-- Select --' },
    { value: 'depends_on', label: 'Depends On' }
  ]

  const componentOptions = [...allComponents]
    ?.sort((a, b) => a?.name?.localeCompare(b?.name))
    .map((item) => ({
      value: item.id,
      label: `${item.name}-${item.version}`
    }))

  componentOptions.unshift({
    value: '',
    label: '-- Select --'
  })

  const handleDateChange = (newDate) => {
    const isValidDate = newDate && !isNaN(newDate)
    setTabData((prev) => ({
      ...prev,
      details: { ...prev?.details, endOfSupport: newDate._d }
    }))
    if (newDate) {
      if (isValidDate) {
        setIsValidDate(true)
      } else {
        setIsValidDate(false)
      }
    }
  }

  useQuery(GetAllComponents, {
    fetchPolicy: 'network-only',
    skip: activeTab === 'components' && signedUrlParams === null ? false : true,
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalComp
    },
    onCompleted: (data) => {
      data && setAllComponents(data?.sbom?.components?.nodes)
      setTabData((prev) => ({
        ...prev,
        relationships: { relType: '', to: '' }
      }))
    }
  })

  const WARNING = useDisclosure()

  const handleCreateCom = () => {
    const hasLicense = details?.licenses?.length > 0
    const isCustomLicense =
      hasLicense && details.licenses[0].type === 'Custom License'

    const license = isCustomLicense
      ? transformLicenseString(details.licenses[0].value)
      : details?.licenses?.[0]?.value || ''

    createComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        kind: details?.kind,
        name: details?.name,
        group: details?.group,
        scope: details?.scope,
        purl: identifiers?.purl,
        primary: details?.primary,
        version: details?.version,
        internal: details?.internal,
        copyright: details?.copyright,
        description: details?.description,
        licenses: { licensesExp: license },
        supportLevel: details?.supportLevel || 'NONE',
        endOfSupport: details?.endOfSupport || '',
        cpes: identifiers?.cpe !== '' ? [identifiers?.cpe] : undefined
      }
    })
      .then((res) => {
        const { errors, component } = res?.data?.componentCreate || ''
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
          showToast({
            description: `Component added successfully`,
            status: 'success'
          })
          if (relationships && component) {
            addRelation({
              variables: {
                from: component?.id,
                to: relationships?.to,
                relType: relationships?.relType
              }
            })
          }
        }
      })
      .finally(() => {
        resetData()
        onClose()
      })
  }

  const onModalClose = () => {
    navigate(link)
    resetData()
    onClose()
  }

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  const invalidVersion =
    details?.name === primaryComp?.name &&
    details?.version === primaryComp?.version

  const isInvalid =
    details?.kind === '' ||
    details?.name === '' ||
    details?.version === '' ||
    loading

  const handlePurlExpand = () => {
    if (showPurl) setShowPurl(false)
    else {
      setPurlValue(identifiers?.purl || 'pkg:type/name@version')
      setShowPurl(true)
    }
  }

  const handleCpeExpand = () => {
    if (showCpe) setShowCpe(false)
    else {
      setCpeValue(identifiers?.cpe || 'cpe:2.3:*:*:*:*:*:*:*:*:*:*:*')
      setShowCpe(true)
    }
  }

  const handleSubmit = () => {
    if (showPurl) {
      handlePurlExpand()
    } else if (showCpe) {
      handleCpeExpand()
    } else {
      handleCreateCom()
    }
  }

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        Icon={LuComponent}
        isLoading={loading}
        title='Add Component'
        onClose={onModalClose}
        onSubmit={handleSubmit}
        hidden={signedUrlParams}
        noFooter={showPurl || showCpe}
        buttonText={showPurl || showCpe ? 'Back' : 'Save'}
        disabled={showPurl || showCpe ? false : isInvalid}
      >
        <Stack direction={'column'} spacing={4} pb={4}>
          {/* Name */}
          {signedUrlParams && <CompInfo data={data} />}
          {showPurl ? (
            <PurlEditor
              isOpen={showPurl}
              value={purlValue}
              setValue={setPurlValue}
              onOpen={() => setShowPurl(true)}
              onClose={() => setShowPurl(false)}
            />
          ) : showCpe ? (
            <CpeEditor
              isOpen={showCpe}
              value={cpeValue}
              setValue={setCpeValue}
              onOpen={() => setShowCpe(true)}
              onClose={() => setShowCpe(false)}
            />
          ) : (
            <>
              <Text>Fill it up to search or add manually</Text>
              {/* Package Lookup */}
              <PackageLookup />
              <DividerWithText text='OR' />
              <Stack spacing={4}>
                {/* Name */}
                <FormControl isRequired isReadOnly={isCustomerView}>
                  <LynkFormLabel
                    label='Name'
                    htmlFor='name'
                    info={onCheck(`Component Name`)}
                  />
                  <Input
                    name='name'
                    value={details?.name}
                    placeholder='Enter name'
                    onChange={(e) =>
                      handleChange('details', 'name', e.target.value)
                    }
                  />
                </FormControl>
                {/* Description */}
                <FormControl isReadOnly={isCustomerView}>
                  <LynkFormLabel
                    label='Description'
                    htmlFor='compDescription'
                    info={onCheck(`Component Description`)}
                  />
                  <Textarea
                    name='description'
                    value={details?.description}
                    placeholder='Add description'
                    onChange={(e) =>
                      handleChange('details', 'description', e.target.value)
                    }
                  />
                </FormControl>
                {/* Copyright */}
                <FormControl isReadOnly={isCustomerView}>
                  <LynkFormLabel
                    label='Copyright'
                    htmlFor='copyright'
                    info={onCheck(`Component Copyright`)}
                  />
                  <Textarea
                    name='copyright'
                    value={details?.copyright}
                    placeholder='Add copyright'
                    onChange={(e) =>
                      handleChange('details', 'copyright', e.target.value)
                    }
                  />
                </FormControl>
                {/* Version */}
                <FormControl
                  isRequired
                  isReadOnly={isCustomerView}
                  isInvalid={invalidVersion}
                >
                  <LynkFormLabel
                    label='Version'
                    htmlFor='version'
                    info={onCheck(`Component Version`)}
                  />
                  <Input
                    name='version'
                    value={details?.version}
                    placeholder='Enter version'
                    onChange={(e) =>
                      handleChange('details', 'version', e.target.value)
                    }
                  />
                  <FormErrorMessage>
                    This version of the product already exists. Continuing will
                    override one of these versions.
                  </FormErrorMessage>
                </FormControl>
                {/* GROUP */}
                <FormControl isReadOnly={isCustomerView}>
                  <LynkFormLabel
                    label='Group'
                    htmlFor='groupInfo'
                    info={onCheck(`Component Group`)}
                  />
                  <Input
                    name='group'
                    value={details?.group}
                    placeholder='Add group'
                    onChange={(e) =>
                      handleChange('details', 'group', e.target.value)
                    }
                  />
                </FormControl>
                {/* KIND */}
                <FormControl isRequired>
                  <LynkFormLabel
                    label='Type'
                    htmlFor='componentType'
                    info={onCheck(`Component Type`)}
                  />
                  <LynkSelect
                    name='kind'
                    aria-label='kind'
                    value={
                      componentTypes.find(
                        (item) => item.value === details?.kind
                      ) || ''
                    }
                    isDisabled={isCustomerView}
                    onChange={(selectedOption) =>
                      handleChange('details', 'kind', selectedOption?.value)
                    }
                    options={componentTypes}
                    dropDown={true}
                    placeholder={
                      componentTypes.find(
                        (item) => item.value === details?.kind
                      )?.label || '--Select--'
                    }
                  />
                </FormControl>
                {/* LICENSES */}
                <LicenseField
                  sbomView={false}
                  isDisabled={signedUrlParams}
                  license={data?.licensesExp}
                />
                <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                  {shortDesc === 'Component Identifier' &&
                    purlString === '' && (
                      <LuMessageCircleWarning
                        w={4}
                        h={4}
                        color={primaryErrorColor}
                      />
                    )}
                  <Text fontSize={'sm'} fontWeight={'medium'}>
                    Identifiers
                  </Text>
                  <Tooltip label={onCheck(`Component Identifiers`)}>
                    <InfoIcon color={primaryBlueText} />
                  </Tooltip>
                </Flex>
                {/* PURL INPUI */}
                <PurlField
                  isOpen={showPurl}
                  onOpen={handlePurlExpand}
                  onClose={() => setShowPurl(false)}
                />
                {/* CPE INPUT */}
                <CpeField
                  isOpen={showCpe}
                  onOpen={handleCpeExpand}
                  onClose={() => setShowCpe(false)}
                />
                {/* SCOPE */}
                <FormControl>
                  <LynkFormLabel
                    label='Scope'
                    htmlFor='compScope'
                    info={onCheck(`Component Scope`)}
                  />
                  <LynkSelect
                    name='scope'
                    value={
                      scopeOptions.find(
                        (item) => item.value === details?.scope
                      ) || ''
                    }
                    isDisabled={isCustomerView}
                    onChange={(selectedOption) => {
                      handleChange('details', 'scope', selectedOption?.value)
                    }}
                    options={scopeOptions}
                    dropDown={true}
                  />
                </FormControl>
                {/* SUPPRT LEVEL */}
                <FormControl hidden={signedUrlParams}>
                  <LynkFormLabel
                    label='Support Level'
                    htmlFor='supportLevel'
                    info={onCheck(`Support Level`)}
                  />
                  <LynkSelect
                    name='supportLevel'
                    value={
                      supportLevels.find(
                        (item) => item.value === details?.supportLevel
                      ) || ''
                    }
                    isDisabled={isCustomerView}
                    onChange={(selectedOption) =>
                      handleChange(
                        'details',
                        'supportLevel',
                        selectedOption?.value
                      )
                    }
                    options={supportLevels}
                    dropDown={true}
                  />
                </FormControl>
                {/* END-OF-SUPPORT DATE */}
                <FormControl
                  mb={5}
                  isInvalid={!isValidDate}
                  hidden={signedUrlParams}
                >
                  <LynkFormLabel
                    label='End-Of-Support Date'
                    htmlFor='endOfSupport'
                    info={onCheck(`End-of-Support Date`)}
                  />
                  <LynkDate
                    value={details?.endOfSupport}
                    onChange={handleDateChange}
                  />
                  {!isValidDate && (
                    <FormErrorMessage>
                      Please enter a valid datetime
                    </FormErrorMessage>
                  )}
                </FormControl>
                {/* PRIMARY COMPONENT */}
                <FormControl isReadOnly={isCustomerView}>
                  <Flex alignItems={'center'} gap={2}>
                    <Checkbox
                      size='sm'
                      name='primary'
                      colorScheme='blue'
                      onChange={() => WARNING.onOpen()}
                      isChecked={details?.primary}
                    >
                      Primary component
                    </Checkbox>
                    <Tooltip label={onCheck(`Primary Component`)}>
                      <InfoIcon fontSize={14} color={primaryBlueText} />
                    </Tooltip>
                  </Flex>
                </FormControl>
                {/* INTERNAL COMPONENT */}
                <FormControl isReadOnly={isCustomerView}>
                  <Flex alignItems={'center'} gap={2}>
                    <Checkbox
                      size='sm'
                      name='internal'
                      colorScheme='blue'
                      isChecked={details?.internal}
                      onChange={(e) =>
                        handleChange('details', 'internal', e.target.checked)
                      }
                    >
                      Internal component
                    </Checkbox>
                    <Tooltip label={onCheck(`Internal Component`)}>
                      <InfoIcon fontSize={14} color={primaryBlueText} />
                    </Tooltip>
                  </Flex>
                </FormControl>
                {/* ADD RELATION */}
                <Text
                  fontSize={'sm'}
                  fontWeight={'medium'}
                  hidden={signedUrlParams}
                >
                  Relationships
                </Text>
                <FormControl hidden={signedUrlParams}>
                  <FormLabel htmlFor='relation' color={headingTextColor}>
                    Type
                  </FormLabel>
                  <LynkSelect
                    size='md'
                    id='relation'
                    value={
                      relationshipTypes.find(
                        (item) => item.value === relationships?.relType
                      ) || ''
                    }
                    onChange={(selectedOption) =>
                      handleChange(
                        'relationships',
                        'relType',
                        selectedOption?.value
                      )
                    }
                    options={relationshipTypes}
                    dropDown={true}
                  />
                </FormControl>
                <FormControl hidden={signedUrlParams}>
                  <FormLabel htmlFor='component' color={headingTextColor}>
                    Component
                  </FormLabel>
                  <LynkSelect
                    size='md'
                    id='component'
                    value={
                      componentOptions.find(
                        (item) => item.value === relationships?.to
                      ) || ''
                    }
                    onChange={(selectedOption) =>
                      handleChange('relationships', 'to', selectedOption?.value)
                    }
                    options={componentOptions}
                    isCreatable={false}
                    dropDown={true}
                  />
                </FormControl>
              </Stack>
            </>
          )}
        </Stack>
      </LynkModal>

      {/* PRIMARY COMPONENT WARNING */}
      {WARNING.isOpen && (
        <PrimaryWarning
          isOpen={WARNING.isOpen}
          onClose={WARNING.onClose}
          primaryComp={primaryComp}
        />
      )}
    </>
  )
}

export default ComponentAddModal
