import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import React, { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSignedUrlParams, transformLicenseString } from 'utils'
import { componentTypes, infoData } from 'variables/general'

import { InfoIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { useDisclosure } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'
import { Flex, Stack, Text, Tooltip } from '@chakra-ui/react'
import { Checkbox, Input, Select, Textarea } from '@chakra-ui/react'

import CpeEditor from 'components/CpeEditor'
import CpeField from 'components/CpeField'
import DividerWithText from 'components/DividerWithText'
import LicenseField from 'components/Licenses/LicenseField'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
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

import { BiLayer } from 'react-icons/bi'

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

  const [createComponent, { loading }] = useMutation(CreateComponent)

  const [allComponents, setAllComponents] = useState([])
  const [showPurl, setShowPurl] = useState(false)
  const [showCpe, setShowCpe] = useState(false)
  const [purlValue, setPurlValue] = useState('')
  const [cpeValue, setCpeValue] = useState('')

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)
  const [isValidDate, setIsValidDate] = useState(true)

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

  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

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
            description: `Data added successfully`,
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

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onModalClose}
        onSubmit={
          showPurl
            ? handlePurlExpand
            : showCpe
              ? handleCpeExpand
              : handleCreateCom
        }
        isLoading={loading}
        disabled={showPurl || showCpe ? false : isInvalid}
        hidden={signedUrlParams}
        title='Add Component'
        Icon={BiLayer}
        buttonText={showPurl || showCpe ? 'Back' : 'Save'}
        noFooter={showPurl || showCpe}
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
                  <Select
                    name='kind'
                    aria-label='kind'
                    value={details?.kind}
                    isDisabled={isCustomerView}
                    textTransform={'capitalize'}
                    onChange={(e) =>
                      handleChange('details', 'kind', e.target.value)
                    }
                  >
                    <option value=''>-- Select --</option>
                    {componentTypes?.map((item, index) => (
                      <option
                        key={index}
                        value={item}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {item}
                      </option>
                    ))}
                  </Select>
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
                      <WarningTwoIcon w={4} h={4} color={primaryErrorColor} />
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
                  <Select
                    name='scope'
                    value={details?.scope}
                    isDisabled={isCustomerView}
                    onChange={(e) =>
                      handleChange('details', 'scope', e.target.value)
                    }
                  >
                    <option value='' style={{ background: 'lightgray' }}>
                      -- Select --
                    </option>
                    <option value='excluded'>Excluded</option>
                    <option value='optional'>Optional</option>
                    <option value='required'>Required</option>
                  </Select>
                </FormControl>
                {/* SUPPRT LEVEL */}
                <FormControl hidden={signedUrlParams}>
                  <LynkFormLabel
                    label='Support Level'
                    htmlFor='supportLevel'
                    info={onCheck(`Support Level`)}
                  />
                  <Select
                    name='supportLevel'
                    value={details?.supportLevel}
                    isDisabled={isCustomerView}
                    onChange={(e) =>
                      handleChange('details', 'supportLevel', e.target.value)
                    }
                  >
                    <option value='' style={{ background: 'lightgray' }}>
                      -- Select --
                    </option>
                    <option value='UNSPECIFIED'>Unspecified</option>
                    <option value='ACTIVELY_MAINTAINED'>
                      Actively Maintained
                    </option>
                    <option value='NO_LONGER_MAINTAINED'>
                      No Longer Maintained
                    </option>
                    <option value='ABANDONED'>Abandoned</option>
                  </Select>
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
                      onChange={onWarningOpen}
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
                  <Select
                    size='md'
                    id='relation'
                    value={relationships?.relType}
                    onChange={(e) =>
                      handleChange('relationships', 'relType', e.target.value)
                    }
                  >
                    <option value=''>-- Select --</option>
                    {[{ value: 'depends_on', label: 'Depends On' }].map(
                      (item, idx) => (
                        <option key={idx} value={item.value}>
                          {item.label}
                        </option>
                      )
                    )}
                  </Select>
                </FormControl>
                <FormControl hidden={signedUrlParams}>
                  <FormLabel htmlFor='component' color={headingTextColor}>
                    Component
                  </FormLabel>
                  <Select
                    size='md'
                    id='component'
                    value={relationships?.to}
                    onChange={(e) =>
                      handleChange('relationships', 'to', e.target.value)
                    }
                  >
                    <option value=''>-- Select --</option>
                    {[...allComponents]
                      .sort((a, b) => a?.name?.localeCompare(b?.name))
                      .map((item, idx) => (
                        <option key={idx} value={item.id}>
                          {item.name}-{item.version}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              </Stack>
            </>
          )}
        </Stack>
      </LynkModal>

      {/* PRIMARY COMPONENT WARNING */}
      {isWarningOpen && (
        <PrimaryWarning
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          primaryComp={primaryComp}
        />
      )}
    </>
  )
}

export default ComponentAddModal
