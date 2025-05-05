import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect } from 'react'
import { transformLicenseString } from 'utils'
import { infoData } from 'variables/general'
import { componentTypes } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Checkbox,
  Input,
  Stack,
  Textarea,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkAlert from 'components/LynkAlert'
import LynkSelect from 'components/LynkSelect'
import LynkFormLabel from 'components/Misc/LynkLabel'
import PrimaryWarning from 'components/Modal/PrimaryWarning'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { UpdateComponent } from 'graphQL/Mutation'
import { GetAllSboms } from 'graphQL/Queries'
import { LicenseAutoComplete } from 'graphQL/Queries'

import ActionButton from './ActionButton'

const CompDetails = ({ data, primaryComp }) => {
  const { showToast } = useCustomToast()
  const { isCustomerView } = useRouteFlags()

  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  const {
    tab,
    unsavedChanges,
    tabData,
    setTabData,
    handleChange,
    saveChanges,
    alert,
    setAlert,
    alertMessage,
    alertMessageSetter
  } = useContext(TabContext)
  const { details } = tabData

  const { sbomId, sbom } = data || ''
  const { id: productId } = sbom?.project || ''

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [updateComponent, { loading }] = useMutation(UpdateComponent)

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)

  let SBOMs = []
  const { data: allSboms } = useQuery(GetAllSboms, {
    fetchPolicy: 'network-only',
    skip: tab === 'details' && !isCustomerView ? false : true,
    variables: { id: productId }
  })

  if (allSboms) {
    const result = allSboms?.project?.sboms
      ?.filter((item) => item?.id !== sbomId)
      ?.map((item) => item?.projectVersion)
    SBOMs = result
  }

  const invalidVersion =
    details?.primary &&
    details?.version !== '' &&
    SBOMs?.includes(details?.version)

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  const handleUpdateCom = () => {
    const hasLicense = details?.licenses?.length > 0
    const isCustomLicense =
      hasLicense && details.licenses[0].type === 'Custom License'

    const license = isCustomLicense
      ? transformLicenseString(details.licenses[0].value)
      : details?.licenses?.[0]?.value || ''

    updateComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        primary: details?.primary,
        internal: details?.internal,
        kind: details?.kind || undefined,
        name: details?.name || undefined,
        scope: details?.scope || undefined,
        group: details?.group || undefined,
        version: details?.version || undefined,
        description: details?.description || '',
        copyright: details?.copyright || undefined,
        supportLevel: details?.supportLevel || 'NONE',
        endOfSupport: details?.endOfSupport || '',
        licenses: { licensesExp: license || '' }
      }
    }).then((res) => {
      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        saveChanges('details')
        showToast({
          description: 'Details updated successfully',
          status: 'success'
        })
        prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  const checkData = () => {
    // eslint-disable-next-line no-unused-vars
    const { details, ...rest } = unsavedChanges

    alertMessageSetter(rest)
    return Object.values(rest).some((value) => value === true)
  }

  const handleSubmit = () => {
    handleUpdateCom()
    if (checkData()) {
      setAlert(true)
    }
  }

  const { data: license, loading: licenseLoading } = useQuery(
    LicenseAutoComplete,
    {
      fetchPolicy: 'network-only',
      variables: { search: data?.licensesExp },
      skip: data?.licensesExp && !isCustomerView ? false : true
    }
  )

  const filteredResults = license
    ? license?.licenseAutoComplete?.result?.slice(0, -1)
    : []
  const matchedLicense = filteredResults
    ? filteredResults?.find((license) => license.value === data?.licensesExp)
    : null

  const isInvalid =
    details?.kind === '' ||
    details?.name === '' ||
    details?.version === '' ||
    loading ||
    licenseLoading

  useEffect(() => {
    if (data) {
      const { supportLevel, licensesExp } = data || {}
      setTabData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          primary: data?.primary,
          name: data?.name || '',
          kind: data?.kind || '',
          scope: data?.scope || '',
          group: data?.group || '',
          internal: data?.internal,
          version: data?.version || '',
          copyright: data?.copyright || '',
          description: data?.description || '',
          licenses: licensesExp
            ? [
                {
                  value: licensesExp,
                  label: licensesExp,
                  type: matchedLicense?.type
                }
              ]
            : [],
          supportLevel: supportLevel?.replaceAll(' ', '_').toUpperCase() || '',
          endOfSupport: data?.endOfSupport ? new Date(data?.endOfSupport) : ''
        }
      }))
    }
  }, [data, matchedLicense?.type, setTabData])

  const scopeOptions = [
    { value: '', label: '-- Select --' },
    { value: 'excluded', label: 'Excluded' },
    { value: 'optional', label: 'Optional' },
    { value: 'required', label: 'Required' }
  ]

  return (
    <>
      <Stack
        spacing={4}
        overflow={'auto'}
        direction={'column'}
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none'
        }}
      >
        {alert && <LynkAlert status='warning' msg={alertMessage} />}
        {/* Name */}
        <FormControl isDisabled={isCustomerView} isRequired>
          <LynkFormLabel
            label='Name'
            htmlFor='name'
            info={onCheck(`Component Name`)}
          />
          <Input
            name='name'
            value={details?.name}
            placeholder='Enter name'
            onChange={(e) => handleChange('details', 'name', e.target.value)}
          />
        </FormControl>
        {/* Version */}
        <FormControl
          isRequired
          isDisabled={isCustomerView}
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
            onChange={(e) => handleChange('details', 'version', e.target.value)}
          />
          <FormErrorMessage>
            This version of the product already exists. Continuing will override
            one of these versions.
          </FormErrorMessage>
        </FormControl>
        {/* Description */}
        <FormControl isDisabled={isCustomerView}>
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
        <FormControl isDisabled={isCustomerView}>
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
        {/* GROUP */}
        <FormControl isDisabled={isCustomerView}>
          <LynkFormLabel
            label='Group'
            htmlFor='groupInfo'
            info={onCheck(`Component Group`)}
          />
          <Input
            name='group'
            value={details?.group}
            placeholder='Add group'
            onChange={(e) => handleChange('details', 'group', e.target.value)}
          />
        </FormControl>
        {/* KIND */}
        <FormControl isRequired isDisabled={isCustomerView}>
          <LynkFormLabel
            label='Type'
            htmlFor='componentType'
            info={onCheck(`Component Type`)}
          />
          <LynkSelect
            name='kind'
            aria-label='kind'
            value={
              componentTypes.find((item) => item.value === details?.kind) || ''
            }
            isDisabled={isCustomerView}
            onChange={(selectedOption) =>
              handleChange('details', 'kind', selectedOption?.value)
            }
            options={componentTypes}
            dropDown={true}
            placeholder={
              componentTypes.find((item) => item.value === details?.kind)
                ?.label || '--Select--'
            }
          />
        </FormControl>
        {/* LICENSES */}
        <LicenseField
          sbomView={false}
          isDisabled={isCustomerView}
          license={data?.licensesExp}
        />
        {/* SCOPE */}
        <FormControl isDisabled={isCustomerView}>
          <LynkFormLabel
            label='Scope'
            htmlFor='compScope'
            info={onCheck(`Component Scope`)}
          />
          <LynkSelect
            name='scope'
            value={scopeOptions.find((opt) => opt.value === details?.scope)}
            onChange={(selected) =>
              handleChange('details', 'scope', selected?.value || '')
            }
            options={scopeOptions}
            placeholder='Select scope'
            dropDown
          />
        </FormControl>
        {/* PRIMARY COMPONENT */}
        <FormControl isDisabled={isCustomerView}>
          <FormLabel>
            <Checkbox
              size='sm'
              name='primary'
              onChange={onOpen}
              colorScheme='blue'
              isChecked={details?.primary}
            >
              Primary component
            </Checkbox>
            <Tooltip label={onCheck(`Primary Component`)}>
              <InfoIcon ml={2} fontSize={14} color={primaryBlueText} />
            </Tooltip>
          </FormLabel>
        </FormControl>
        {/* INTERNAL COMPONENT */}
        <FormControl isDisabled={isCustomerView}>
          <FormLabel>
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
              <InfoIcon ml={2} fontSize={14} color={primaryBlueText} />
            </Tooltip>
          </FormLabel>
        </FormControl>
        <ActionButton
          title={'Save'}
          hidden={isCustomerView}
          isDisabled={isInvalid}
          onClick={handleSubmit}
        />
      </Stack>

      {isOpen && (
        <PrimaryWarning
          isOpen={isOpen}
          onClose={onClose}
          primaryComp={primaryComp}
        />
      )}
    </>
  )
}

export default CompDetails
