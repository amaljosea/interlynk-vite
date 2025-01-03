import { useLazyQuery, useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { disableButtonTemporarily, transformLicenseString } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { componentTypes } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import { FormErrorMessage, List, ListItem, Stack } from '@chakra-ui/react'
import { Box, Button, Flex, Icon, Text, Tooltip } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Select } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LicenseField from 'components/Licenses/LicenseField'
import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import { useThemeColor } from 'hooks/useThemeColors'

import { AutomationRuleCreate, UpdateComponent } from 'graphQL/Mutation'
import { GetComponentData } from 'graphQL/Queries'

import { BiWrench } from 'react-icons/bi'

const CheckModal = (props) => {
  const { isOpen, onClose, activeRow, ruleExists, recheck } = props

  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { projects, loading: envLoading } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

  const [options, setOptions] = useState([])
  const [defaultEnv, setDefaultEnv] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])
  const { tabData } = useContext(TabContext)
  const { details } = tabData

  const { primaryBgColor, secondaryBgColor, primaryBlueText } = useThemeColor([
    'primaryBgColor',
    'secondaryBgColor',
    'primaryBlueText'
  ])

  const { status, component } = activeRow || ''
  const { id: componentId, name, version, kind, licensesExp } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'

  const level =
    component?.supportLevel?.replaceAll(' ', '_').toUpperCase() || ''
  const endData = component?.endOfSupport
    ? new Date(component?.endOfSupport)
    : ''

  const compRef = useRef()

  // GET COMPONENT DATA
  const [getCompData, { data }] = useLazyQuery(GetComponentData, {
    fetchPolicy: 'network-only'
  })

  const [createRule, { loading }] = useMutation(AutomationRuleCreate)

  const { prodCompState } = useGlobalState()
  const { field, direction } = prodCompState

  const now = new Date()
  const timestamp = currentTime
  const currentTime = now.toISOString().slice(0, 16)
  const [comp, setComp] = useState('')
  const [compType, setCompType] = useState(kind || '')
  const [compVersion, setCompVersion] = useState(version || '')
  const [supportLevel, setSupportLevel] = useState(level || '')
  const [endOfSupport, setEndOfSupport] = useState(endData)
  const [componentList, setComponentList] = useState([])
  const [isValidDate, setIsValidDate] = useState(true)
  const [activeComp, setActiveComp] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const [error, setError] = useState('')

  const isPrimary = shortDesc === 'Document has a primary component'
  const isComponentType = shortDesc === 'Component has a type'
  const isComponentVersion = shortDesc === 'Component has a version'
  const isComponentSupport = shortDesc === 'Component has support level'
  const isComponentLicense =
    shortDesc === 'Component has license/s specified' ||
    shortDesc === 'Componet has deprecated license/s' ||
    shortDesc === 'Component has restrictive licenses specified'
  const isComponent =
    isPrimary ||
    isComponentType ||
    isComponentVersion ||
    isComponentLicense ||
    isComponentSupport

  const isInvalidLicense = isComponentLicense && details?.licenses?.length === 0

  const isEmptyVersion = isComponentVersion && compVersion === ''
  const isEmptySupport = isComponentSupport && supportLevel === ''

  const [updateComponent] = useMutation(UpdateComponent, {
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

  const handleDateChange = (newDate) => {
    const isValidDate = newDate && !isNaN(newDate)
    setEndOfSupport(newDate?._d)
    if (newDate) {
      if (isValidDate) {
        setIsValidDate(true)
      } else {
        setIsValidDate(false)
      }
    }
  }

  const handleComUpdate = () => {
    disableButtonTemporarily(setIsDisabled)
    if (resolved) {
      onClose()
    } else {
      const hasLicense = details?.licenses?.length > 0
      const isCustomLicense =
        hasLicense && details.licenses[0].type === 'Custom License'

      const license = isCustomLicense
        ? transformLicenseString(details.licenses[0].value)
        : details?.licenses?.[0]?.value || ''
      const licensesExp = { licensesExp: license }
      updateComponent({
        variables: {
          sbomId: sbomId,
          supportLevel: supportLevel || 'NONE',
          endOfSupport: endOfSupport || '',
          id: isPrimary ? activeComp?.id : componentId,
          primary: isPrimary ? true : undefined,
          kind: isComponentType ? compType : undefined,
          version: isComponentVersion ? compVersion : undefined,
          licenses: license && !isPrimary ? licensesExp : undefined
        }
      }).then((res) => {
        const { errors } = res?.data?.componentUpdate || ''
        if (errors?.length) {
          setError(errors[0])
        } else {
          onClose()
        }
      })
    }
  }

  const handleComponentChange = (e) => {
    const value = e.target.value
    setComp(value)
    if (value === '') {
      setComponentList([])
    } else {
      const filterData = data?.sbom.components.nodes.filter((str) =>
        str.name.includes(value)
      )
      setComponentList(filterData ? filterData : [])
    }
  }

  const heading = (name) => {
    switch (name) {
      case 'Document creation timestamp':
        return 'Timestamp'
      case 'Document has a primary component':
        return 'Primary Component'
      case 'Component has a type':
        return 'Component Type'
      case 'Component has a valid type':
        return 'Component Type'
      case 'Component has license/s specified':
        return 'Component License'
      case 'Component has a version':
        return 'Component Version'
      case 'Componet has deprecated license/s':
        return 'Component License'
      case 'Component has restrictive licenses specified':
        return 'Component License'
      case 'Document has data license specified':
        return 'Component License'
      case 'Component has support level':
        return 'Component Support'
    }
  }

  const handleSubmit = () => {
    if (isComponent) {
      handleComUpdate()
    } else {
      onClose()
    }
  }

  const getConditionsAttributes = () => {
    if (isComponentLicense) {
      return [
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
          field: 'component_licenses_exp',
          value: undefined
        }
      ]
    } else if (isComponentVersion) {
      return [
        {
          subject: 'component',
          operator: 'is',
          field: 'component_name',
          value: component?.name
        },
        {
          subject: 'component',
          operator: 'not_exists',
          field: 'component_version',
          value: undefined
        }
      ]
    } else if (isComponentSupport) {
      return [
        {
          subject: 'component',
          operator: 'is',
          field: 'component_name',
          value: component?.name
        },
        {
          subject: 'component',
          operator: 'not_exists',
          field: 'component_support_level',
          value: undefined
        },
        {
          subject: 'component',
          operator: 'not_exists',
          field: 'component_end_of_support',
          value: undefined
        }
      ]
    }
  }

  const filterConditions = getConditionsAttributes()?.filter(
    (item) => item?.field !== 'component_licenses_exp'
  )

  const getActionsAttributes = () => {
    if (isComponentLicense) {
      return [
        {
          subject: 'component',
          field: 'component_licenses_exp',
          value: details?.licenses[0]?.value || ''
        }
      ]
    } else if (isComponentSupport) {
      return [
        {
          subject: 'component',
          field: 'component_support_level',
          value: supportLevel?.replaceAll(' ', '_').toUpperCase() || ''
        },
        {
          subject: 'component',
          field: 'component_end_of_support',
          value: endOfSupport ? new Date(endOfSupport) : undefined
        }
      ]
    } else if (isComponentVersion) {
      return [
        {
          subject: 'component',
          field: 'component_version',
          value: compVersion
        }
      ]
    } else {
      return []
    }
  }

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
      disableButtonTemporarily(setIsDisabled)

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
              shortDesc === 'Component has license/s specified'
                ? getConditionsAttributes()
                : filterConditions,
            automationActionsAttributes: getActionsAttributes()
          }
        })
      )

      try {
        const res = await Promise.all(mutationPromises)
        const errors = res?.flatMap(
          (r) => r?.data?.automationRuleCreate?.errors || []
        )

        if (errors.length > 0) {
          setError(errors[0])
        } else {
          if (isComponent) {
            handleComUpdate()
          } else {
            onClose()
          }
          showToast({
            description: 'Rule added successfully',
            status: 'success'
          })
        }
      } catch (error) {
        console.error('Error during rule creation', error)
        setError('An unexpected error occurred.')
      }
    }
  }

  const inputStyle = { size: 'md', fontSize: 'sm' }

  const disabled =
    isInvalidLicense ||
    isEmptyVersion ||
    isDisabled ||
    (isComponentLicense && details?.licenses?.length === 0)

  const disabledRule =
    isInvalidLicense || isEmptyVersion || isDisabled || isEmptySupport

  const hideRule =
    !isComponentLicense && !isComponentVersion && !isComponentSupport

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (compRef.current && !compRef.current.contains(event.target)) {
        setComponentList([])
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isPrimary) {
      getCompData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: 100,
          field: field,
          direction: direction
        }
      }).then(
        (res) => res.data && setComponentList(res.data.sbom.components.nodes)
      )
    }
  }, [direction, field, getCompData, isPrimary, productId, sbomId])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={heading(shortDesc)}
      Icon={BiWrench}
      disabled={disabled}
      hidden={resolved}
      buttonText={'Save'}
      leftFooterContent={
        !isFreeTier && (
          <Button
            mr={'auto'}
            variant='ghost'
            fontSize={'sm'}
            hidden={hideRule}
            isLoading={loading}
            isDisabled={disabledRule}
            onClick={handleRuleCreate}
            colorScheme={ruleExists ? 'green' : 'blue'}
            title={`${ruleExists ? 'View' : 'Save as'} Rule`}
          >
            {ruleExists ? 'View' : 'Save as'} Rule
          </Button>
        )
      }
    >
      {error !== '' && (
        <Box mb={4}>
          <LynkAlert msg={error} />
        </Box>
      )}

      {component && (
        <Box mb={4}>
          <CompInfo data={component} />
        </Box>
      )}

      {shortDesc === 'Document has a primary component' && (
        <Flex
          gap={4}
          flexDirection={'column'}
          alignItems={'flex-start'}
          position={'relative'}
        >
          <FormControl isRequired isDisabled={resolved}>
            <FormLabel>Select</FormLabel>
            <Input value={comp} onChange={handleComponentChange} />
          </FormControl>
          {/* Environment Select */}
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

          {comp !== '' && componentList.length > 0 && (
            <Box
              position='absolute'
              zIndex='1'
              width='100%'
              top={10}
              mt='8'
              bg={primaryBgColor}
              border={`1px solid ${secondaryBgColor}`}
              minH={'auto'}
              maxH={'300px'}
              overflowY={'scroll'}
              borderRadius={4}
              ref={compRef}
            >
              <List>
                {componentList.map((item, index) => (
                  <ListItem
                    key={index}
                    cursor='pointer'
                    fontSize={'sm'}
                    onClick={() => {
                      setActiveComp(item)
                      setComp(item.name)
                      setComponentList([])
                    }}
                    p='2'
                    _hover={{ background: secondaryBgColor }}
                  >
                    <Text>{item.name}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Flex>
      )}

      {shortDesc === 'Document creation timestamp' && (
        <>
          <FormControl isRequired isDisabled={resolved}>
            <FormLabel>Created At</FormLabel>
            <Input
              placeholder='Select Time'
              size='md'
              type='datetime-local'
              value={timestamp}
              onChange={(e) => console.log(e.target.value)}
            />
          </FormControl>
          {/* Environment Select */}
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
        </>
      )}

      {(shortDesc === 'Component has a type' ||
        shortDesc === 'Component has a valid type') && (
        <>
          <FormControl isDisabled={resolved}>
            <FormLabel>
              <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                <Text>Type</Text>
                <Tooltip label='Component Type'>
                  <Icon as={InfoIcon} color={primaryBlueText} />
                </Tooltip>
              </Flex>
            </FormLabel>
            <Select
              id='type'
              name='type'
              value={compType}
              onChange={(e) => setCompType(e.target.value)}
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
          {/* Environment Select */}
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
        </>
      )}

      {shortDesc === 'Component has a version' && (
        <>
          <FormControl isRequired isDisabled={resolved}>
            <FormLabel>Version</FormLabel>
            <Input
              value={compVersion}
              onChange={(e) => setCompVersion(e.target.value)}
            />
          </FormControl>
          {/* Environment Select */}
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
        </>
      )}

      {isComponentSupport && (
        <Stack spacing={5}>
          <FormControl isRequired>
            <FormLabel htmlFor='supportLevel'>Support Level</FormLabel>
            <Select
              sx={inputStyle}
              name='supportLevel'
              value={supportLevel}
              onChange={(e) => setSupportLevel(e.target.value)}
            >
              <option value=''>-- Select --</option>
              <option value='UNSPECIFIED'>Unspecified</option>
              <option value='ACTIVELY_MAINTAINED'>Actively Maintained</option>
              <option value='NO_LONGER_MAINTAINED'>No Longer Maintained</option>
              <option value='ABANDONED'>Abandoned</option>
            </Select>
          </FormControl>
          {/* END-OF-SUPPORT DATE */}
          <FormControl mb={5} isInvalid={!isValidDate}>
            <FormLabel htmlFor='endOfSupport'>End-Of-Support Date</FormLabel>
            <LynkDate
              name='endOfSupport'
              value={endOfSupport}
              onChange={handleDateChange}
            />
            {!isValidDate && (
              <FormErrorMessage>Please enter a valid datetime</FormErrorMessage>
            )}
          </FormControl>
          {/* Environment Select */}
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
        </Stack>
      )}

      {isComponentLicense && (
        <>
          <LicenseField
            sbomView={false}
            resolved={resolved}
            license={licensesExp}
          />
          {/* Environment Select */}
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
        </>
      )}
    </LynkModal>
  )
}

export default CheckModal
