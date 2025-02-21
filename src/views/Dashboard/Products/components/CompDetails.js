import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect } from 'react'
import { isCustomerView, transformLicenseString } from 'utils'
import { infoData } from 'variables/general'
import { componentTypes } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Checkbox,
  Divider,
  Input,
  Select,
  Stack,
  Textarea,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkAlert from 'components/LynkAlert'
import LynkFormLabel from 'components/Misc/LynkLabel'
import PrimaryWarning from 'components/Modal/PrimaryWarning'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { UpdateComponent } from 'graphQL/Mutation'
import { GetAllSboms } from 'graphQL/Queries'
import { LicenseAutoComplete } from 'graphQL/Queries'

import ActionButton from './ActionButton'

const CompDetails = ({ data, primaryComp }) => {
  const { showToast } = useCustomToast()
  const customerView = isCustomerView()

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
    setAlert
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
    skip: tab === 'details' && !customerView ? false : true,
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

  const [getLicense, { loading: licenseLoading }] = useLazyQuery(
    LicenseAutoComplete,
    {
      skip: data?.licensesExp ? false : true,
      fetchPolicy: 'network-only'
    }
  )

  const isInvalid =
    details?.kind === '' ||
    details?.name === '' ||
    details?.version === '' ||
    loading ||
    licenseLoading

  useEffect(() => {
    if (data) {
      const { supportLevel, licensesExp } = data || {}

      if (licensesExp) {
        getLicense({ variables: { search: licensesExp } }).then((res) => {
          const filteredResults =
            res.data?.licenseAutoComplete?.result?.slice(0, -1) || []
          const matchedLicense = filteredResults.find(
            (license) => license.value === licensesExp
          )

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
              supportLevel:
                supportLevel?.replaceAll(' ', '_').toUpperCase() || '',
              licenses: licensesExp
                ? [
                    {
                      value: licensesExp,
                      label: licensesExp,
                      type: matchedLicense?.type
                    }
                  ]
                : [],
              endOfSupport: data?.endOfSupport
                ? new Date(data?.endOfSupport)
                : ''
            }
          }))
        })
      } else {
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
            supportLevel:
              supportLevel?.replaceAll(' ', '_').toUpperCase() || '',
            licenses: [],
            endOfSupport: data?.endOfSupport ? new Date(data?.endOfSupport) : ''
          }
        }))
      }
    }
  }, [data, setTabData, getLicense])

  return (
    <>
      <Stack direction={'column'} spacing={4} px={6}>
        {/* Name */}
        <FormControl isDisabled={customerView} isRequired>
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
          isDisabled={customerView}
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
        <FormControl isDisabled={customerView}>
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
        <FormControl isDisabled={customerView}>
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
        <FormControl isDisabled={customerView}>
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
        <FormControl isRequired isDisabled={customerView}>
          <LynkFormLabel
            label='Type'
            htmlFor='componentType'
            info={onCheck(`Component Type`)}
          />
          <Select
            name='kind'
            value={details?.kind}
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
          <LynkFormLabel
            label='Scope'
            htmlFor='compScope'
            info={onCheck(`Component Scope`)}
          />
          <Select
            name='scope'
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
              title={'Save'}
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
