import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import React, { useContext, useEffect, useState } from 'react'
import { isCustomerView, transformLicenseString } from 'utils'
import { infoData } from 'variables/general'
import { componentTypes } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  Tooltip,
  chakra,
  useDisclosure
} from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import PrimaryWarning from 'components/Modal/PrimaryWarning'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { UpdateComponent } from 'graphQL/Mutation'
import { GetAllSboms } from 'graphQL/Queries'

import ActionButton from './ActionButton'

const CompDetails = ({ data, primaryComp }) => {
  const { showToast } = useCustomToast()
  const customerView = isCustomerView()

  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch
  const { primaryErrorColor, primaryBlueText } = useThemeColor([
    'primaryErrorColor',
    'primaryBlueText'
  ])
  const {
    tab,
    unsavedChanges,
    tabData,
    setTabData,
    handleChange,
    saveChanges,
    alert,
    setAlert
  } = useContext(TabContext)
  const { details } = tabData

  const inputStyle = { size: 'md', fontSize: 'sm' }

  const { sbomId, sbom } = data || ''
  const { id: productId } = sbom?.project || ''

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [updateComponent, { loading }] = useMutation(UpdateComponent)

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

  let SBOMs = []
  const { data: allSboms } = useQuery(GetAllSboms, {
    fetchPolicy: 'network-only',
    skip: tab === 0 && !customerView ? false : true,
    variables: {
      id: productId
    }
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
        licenses: license ? { licensesExp: license } : undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        saveChanges()
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
    return Object.values(rest).some((value) => value === true)
  }

  const handleSubmit = () => {
    if (checkData()) {
      setAlert(true)
    } else {
      handleUpdateCom()
    }
  }

  const isInvalid =
    details?.kind === '' ||
    details?.name === '' ||
    details?.version === '' ||
    loading

  useEffect(() => {
    if (data) {
      const { supportLevel, licensesExp } = data || {}
      setTabData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          name: data?.name || '',
          kind: data?.kind || '',
          scope: data?.scope || '',
          group: data?.group || '',
          primary: data?.primary,
          version: data?.version || '',
          internal: data?.internal,
          description: data?.description || '',
          copyright: data?.copyright || '',
          supportLevel: supportLevel?.replaceAll(' ', '_').toUpperCase() || '',
          licenses: licensesExp
            ? [{ value: licensesExp, label: licensesExp }]
            : [],
          endOfSupport: data?.endOfSupport ? new Date(data?.endOfSupport) : ''
        }
      }))
    }
  }, [data, setTabData])

  return (
    <>
      <Stack direction={'column'} spacing={4} px={6}>
        {/* Name */}
        <FormControl isDisabled={customerView}>
          <FormLabel htmlFor='name'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
              <Text>
                Name
                <chakra.span color={primaryErrorColor} ml={1}>
                  *
                </chakra.span>
              </Text>
              <Tooltip label={onCheck(`Component Name`)}>
                <InfoIcon color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Input
            name='name'
            sx={inputStyle}
            value={details?.name}
            placeholder='Enter name'
            onChange={(e) => handleChange('details', 'name', e.target.value)}
          />
        </FormControl>
        {/* Description */}
        <FormControl isDisabled={customerView}>
          <FormLabel htmlFor='compDescription'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
              <Text>Description</Text>
              <Tooltip label={onCheck(`Component Description`)}>
                <InfoIcon color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Textarea
            sx={inputStyle}
            name='description'
            value={details?.description}
            placeholder='Add description'
            onChange={(e) =>
              handleChange('details', 'description', e.target.value)
            }
          />
        </FormControl>
        {/* Copyright */}
        <FormControl isDisabled={customerView}>
          <FormLabel htmlFor='copyright'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
              <Text>Copyright</Text>
              <Tooltip label={onCheck(`Component Copyright`)}>
                <InfoIcon color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Textarea
            sx={inputStyle}
            name='copyright'
            value={details?.copyright}
            placeholder='Add copyright'
            onChange={(e) =>
              handleChange('details', 'copyright', e.target.value)
            }
          />
        </FormControl>
        {/* Version */}
        <FormControl isDisabled={customerView} isInvalid={invalidVersion}>
          <FormLabel htmlFor='version'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
              <Text>
                Version{' '}
                <chakra.span color={primaryErrorColor} ml={1}>
                  *
                </chakra.span>
              </Text>
              <Tooltip label={onCheck(`Component Version`)}>
                <InfoIcon color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Input
            name='version'
            sx={inputStyle}
            value={details?.version}
            placeholder='Enter version'
            onChange={(e) => handleChange('details', 'version', e.target.value)}
          />
          <FormErrorMessage>
            This version of the product already exists. Continuing will override
            one of these versions.
          </FormErrorMessage>
        </FormControl>
        {/* GROUP */}
        <FormControl isDisabled={customerView}>
          <FormLabel htmlFor='groupInfo'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
              <Text>Group</Text>
              <Tooltip label={onCheck(`Component Group`)}>
                <InfoIcon color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Input
            name='group'
            value={details?.group}
            sx={inputStyle}
            placeholder='Add group'
            onChange={(e) => handleChange('details', 'group', e.target.value)}
          />
        </FormControl>
        {/* KIND */}
        <FormControl isDisabled={customerView}>
          <FormLabel htmlFor='componentType'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
              <Text>
                Type{' '}
                <chakra.span color={primaryErrorColor} ml={1}>
                  *
                </chakra.span>
              </Text>
              <Tooltip label={onCheck(`Component Type`)}>
                <InfoIcon color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Select
            name='kind'
            value={details?.kind}
            sx={inputStyle}
            textTransform={'capitalize'}
            onChange={(e) => handleChange('details', 'kind', e.target.value)}
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
          isDisabled={customerView}
          license={data?.licensesExp}
        />
        {/* SCOPE */}
        <FormControl isDisabled={customerView}>
          <FormLabel htmlFor='compScope'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
              <Text>Scope</Text>
              <Tooltip label={onCheck(`Component Scope`)}>
                <InfoIcon color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Select
            name='scope'
            sx={inputStyle}
            value={details?.scope}
            onChange={(e) => handleChange('details', 'scope', e.target.value)}
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
        <FormControl hidden={customerView}>
          <FormLabel htmlFor='supportLevel'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
              <Text>Support Level</Text>
              <Tooltip label={onCheck(`Support Level`)}>
                <InfoIcon color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Select
            sx={inputStyle}
            name='supportLevel'
            value={details?.supportLevel}
            isDisabled={customerView}
            onChange={(e) =>
              handleChange('details', 'supportLevel', e.target.value)
            }
          >
            <option value='' style={{ background: 'lightgray' }}>
              -- Select --
            </option>
            <option value='UNSPECIFIED'>Unspecified</option>
            <option value='ACTIVELY_MAINTAINED'>Actively Maintained</option>
            <option value='NO_LONGER_MAINTAINED'>No Longer Maintained</option>
            <option value='ABANDONED'>Abandoned</option>
          </Select>
        </FormControl>
        {/* END-OF-SUPPORT DATE */}
        <FormControl mb={5} isInvalid={!isValidDate} hidden={customerView}>
          <FormLabel htmlFor='endOfSupport'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
              <Text>End-Of-Support Date</Text>
              <Tooltip label={onCheck(`End-of-Support Date`)}>
                <InfoIcon color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <LynkDate
            name='endOfSupport'
            value={details?.endOfSupport}
            onChange={handleDateChange}
          />
          {!isValidDate && (
            <FormErrorMessage>Please enter a valid datetime</FormErrorMessage>
          )}
        </FormControl>
        {/* PRIMARY COMPONENT */}
        <FormControl isDisabled={customerView}>
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
        <FormControl isDisabled={customerView}>
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
        <Divider hidden={customerView} />
        {alert ? (
          <Stack spacing={4}>
            <LynkAlert
              status='warning'
              msg='Saving will apply changes to this tab only. save other tabs separately to retain their data.'
            />
            <ActionButton
              title={'Save Details'}
              isDisabled={isInvalid}
              onClick={handleUpdateCom}
            />
          </Stack>
        ) : (
          <ActionButton
            title={'Save'}
            hidden={customerView}
            isDisabled={isInvalid}
            onClick={handleSubmit}
          />
        )}
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
