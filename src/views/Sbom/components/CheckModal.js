import { useLazyQuery, useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { disableButtonTemporarily, transformLicenseString } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { componentTypes } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import { List, ListItem, Stack } from '@chakra-ui/react'
import { Box, Button, Flex, Icon, Text, Tooltip } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Select } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LicenseField from 'components/Licenses/LicenseField'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
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

  const compRef = useRef()

  const { prodCompState } = useGlobalState()
  const { field, direction } = prodCompState

  const { AUTOMATION_RULES } = ProductDetailsTabs

  const link = generateProductDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: AUTOMATION_RULES
    }
  })

  const now = new Date()
  const timestamp = currentTime
  const currentTime = now.toISOString().slice(0, 16)

  const [comp, setComp] = useState('')
  const [error, setError] = useState('')
  const [activeComp, setActiveComp] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const [compType, setCompType] = useState(kind || '')
  const [componentList, setComponentList] = useState([])
  const [compVersion, setCompVersion] = useState(version || '')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const PRIMARY_COMPONENT = shortDesc === 'Document has a primary component'
  const CREATION_TIMESTAMP = shortDesc === 'Document creation timestamp'
  const COMPONENT_TYPE =
    shortDesc === 'Component has a type' ||
    shortDesc === 'Component has a valid type'
  const COMPONENT_VERSION = shortDesc === 'Component has a version'
  const COMPONENT_LICENSE =
    shortDesc === 'Component has license/s specified' ||
    shortDesc === 'Componet has deprecated license/s' ||
    shortDesc === 'Component has restrictive licenses specified'

  const isInvalidLicense = COMPONENT_LICENSE && details?.licenses?.length === 0

  const isEmptyVersion = COMPONENT_VERSION && compVersion === ''

  const disabled =
    isInvalidLicense ||
    isEmptyVersion ||
    isDisabled ||
    (COMPONENT_LICENSE && details?.licenses?.length === 0)

  const disabledRule = isInvalidLicense || isEmptyVersion || isDisabled

  const hideRule = !COMPONENT_LICENSE && !COMPONENT_VERSION

  const [getCompData, { data }] = useLazyQuery(GetComponentData, {
    fetchPolicy: 'network-only'
  })

  const [createRule, { loading: ruleLoading }] =
    useMutation(AutomationRuleCreate)

  const [updateComponent, { loading: loading }] = useMutation(UpdateComponent, {
    onCompleted: () => recheck()
  })

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
    }
  }

  const getConditionsAttributes = () => {
    if (COMPONENT_LICENSE) {
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
    } else if (COMPONENT_VERSION) {
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
    }
  }

  const filterConditions = getConditionsAttributes()?.filter(
    (item) => item?.field !== 'component_licenses_exp'
  )

  const getActionsAttributes = () => {
    if (COMPONENT_LICENSE) {
      return [
        {
          subject: 'component',
          field: 'component_licenses_exp',
          value: details?.licenses[0]?.value || ''
        }
      ]
    } else if (COMPONENT_VERSION) {
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

  const handleComUpdate = async (applyRule) => {
    try {
      const hasLicense = details?.licenses?.length > 0
      const isCustomLicense =
        hasLicense && details.licenses[0].type === 'Custom License'
      const license = isCustomLicense
        ? transformLicenseString(details.licenses[0].value)
        : details?.licenses?.[0]?.value || ''
      const licensesExp = { licensesExp: license }

      const res = await updateComponent({
        variables: {
          sbomId: sbomId,
          id: PRIMARY_COMPONENT ? activeComp?.id : componentId,
          primary: PRIMARY_COMPONENT ? true : undefined,
          kind: COMPONENT_TYPE ? compType : undefined,
          version: COMPONENT_VERSION ? compVersion : undefined,
          licenses: license && !PRIMARY_COMPONENT ? licensesExp : undefined
        }
      })

      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length) {
        setError(errors[0])
      }

      if (applyRule) {
        await handleRuleCreate()
      }
    } finally {
      onClose()
    }
  }

  const handleSubmit = () => handleComUpdate(false)

  const handleAutomation = async () => {
    if (resolved) {
      await handleRuleCreate().then(() => onClose())
    } else {
      handleComUpdate(true)
    }
  }

  const RuleAction = () => {
    return (
      <Button
        mr={'auto'}
        fontSize={'sm'}
        variant='ghost'
        hidden={hideRule}
        loadingText='Loading...'
        isLoading={ruleLoading}
        isDisabled={disabledRule}
        onClick={handleAutomation}
        colorScheme={ruleExists ? 'green' : 'blue'}
        title={`${ruleExists ? 'View' : 'Save as'} Rule`}
      >
        {ruleExists ? 'View' : 'Save as'} Rule
      </Button>
    )
  }

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
    if (PRIMARY_COMPONENT) {
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
  }, [direction, field, getCompData, PRIMARY_COMPONENT, productId, sbomId])

  return (
    <LynkModal
      isOpen={isOpen}
      Icon={BiWrench}
      onClose={onClose}
      disabled={disabled}
      buttonText={'Save'}
      isLoading={loading}
      onSubmit={handleSubmit}
      title={heading(shortDesc)}
      hideCancelButton={ruleLoading}
      hidden={resolved || ruleLoading}
      leftFooterContent={!isFreeTier && <RuleAction />}
    >
      <Stack mb={error || component ? 4 : 0}>
        {error !== '' && <LynkAlert msg={error} />}
        {component && <CompInfo data={component} />}
      </Stack>

      {PRIMARY_COMPONENT && (
        <Stack spacing={4}>
          <FormControl isRequired isDisabled={resolved}>
            <FormLabel>Select</FormLabel>
            <Input value={comp} onChange={handleComponentChange} />
          </FormControl>

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
        </Stack>
      )}

      {CREATION_TIMESTAMP && (
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
      )}

      {COMPONENT_TYPE && (
        <Stack>
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
        </Stack>
      )}

      {COMPONENT_VERSION && (
        <FormControl isRequired isDisabled={resolved}>
          <FormLabel>Version</FormLabel>
          <Input
            value={compVersion}
            onChange={(e) => setCompVersion(e.target.value)}
          />
        </FormControl>
      )}

      {COMPONENT_LICENSE && (
        <LicenseField
          sbomView={false}
          resolved={resolved}
          license={licensesExp}
        />
      )}

      <Stack mt={2}>
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

export default CheckModal
