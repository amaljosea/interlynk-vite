import { useLazyQuery, useMutation } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tag,
  Text,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { AutomationRuleCreate, UpdateComponent } from 'graphQL/Mutation'
import { GetComponentData } from 'graphQL/Queries'

const CheckModal = ({ isOpen, onClose, activeRow, ruleExists, isFreeTier }) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const navigate = useNavigate()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const bgColor = useColorModeValue('#F7FAFC', '#1A202C')
  const hoverColor = useColorModeValue('#EDF2F7', '#2D3748')

  const { status, component } = activeRow || ''
  const { id: componentId, name, version, kind, licensesExp } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'

  const compRef = useRef()

  // GET COMPONENT DATA
  const [getCompData, { data }] = useLazyQuery(GetComponentData, {
    fetchPolicy: 'network-only'
  })

  const [createRule] = useMutation(AutomationRuleCreate)

  const { prodCompState } = useGlobalState()
  const { field, direction, expLicense } = prodCompState

  const now = new Date()
  const timestamp = currentTime
  const currentTime = now.toISOString().slice(0, 16)
  const [comp, setComp] = useState('')
  const [compType, setCompType] = useState(kind || '')
  const [compVersion, setCompVersion] = useState(version || '')
  const [componentList, setComponentList] = useState([])
  const [activeComp, setActiveComp] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const [error, setError] = useState('')

  const disableButtonTemporarily = () => {
    setIsDisabled(true)
    setTimeout(() => {
      setIsDisabled(false)
    }, 3000)
  }

  const isPrimary = shortDesc === 'Document has a primary component'
  const isComponentType = shortDesc === 'Component has a type'
  const isComponentVersion = shortDesc === 'Component has a version'
  const isComponentLicense =
    shortDesc === 'Component has license/s specified' ||
    shortDesc === 'Componet has deprecated license/s' ||
    shortDesc === 'Component has restrictive licenses specified'
  const isComponent =
    isPrimary || isComponentType || isComponentVersion || isComponentLicense

  const isInvalidLicense = isComponentLicense && expLicense === ''

  const isEmptyVersion = isComponentVersion && compVersion === ''

  const [updateComponent] = useMutation(UpdateComponent)

  const handleComUpdate = () => {
    disableButtonTemporarily()
    if (resolved) {
      onClose()
    } else {
      updateComponent({
        variables: {
          sbomId: sbomId,
          id: isPrimary ? activeComp?.id : componentId,
          primary: isPrimary ? true : undefined,
          kind: isComponentType ? compType : undefined,
          version: isComponentVersion ? compVersion : undefined,
          licenses: {
            licensesExp: isPrimary ? undefined : expLicense || undefined
          }
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
          value: expLicense
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
      disableButtonTemporarily()
      createRule({
        variables: {
          active: true,
          name: shortDesc,
          projectId: productId,
          checkComponent: name,
          checkVersion: version,
          checkIdentifier: friendlyId,
          automationConditionsAttributes:
            shortDesc === 'Component has license/s specified'
              ? getConditionsAttributes()
              : filterConditions,
          automationActionsAttributes: getActionsAttributes()
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          if (isComponent) {
            handleComUpdate()
          } else {
            onClose()
          }
        }
      })
    }
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
    <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{heading(shortDesc)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error !== '' && (
            <Alert status='error' borderRadius={4} mb={5}>
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Flex
            hidden={component ? false : true}
            width='100%'
            direction={'row'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            wrap={'wrap'}
            gap={2}
            mb={6}
          >
            <Text fontWeight={'medium'} wordBreak={'break-all'}>
              {component?.name || '-'}
            </Text>
            <Tag colorScheme='blue'>{component?.version || '-'}</Tag>
          </Flex>

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

              {comp !== '' && componentList.length > 0 && (
                <Box
                  position='absolute'
                  zIndex='1'
                  width='100%'
                  top={10}
                  mt='8'
                  bg={bgColor}
                  border={`1px solid ${hoverColor}`}
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
                        _hover={{ background: hoverColor }}
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

          {(shortDesc === 'Component has a type' ||
            shortDesc === 'Component has a valid type') && (
            <FormControl isDisabled={resolved}>
              <FormLabel fontSize={'sm'}>
                <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                  <Text>Type</Text>
                  <Tooltip label='Component Type'>
                    <Icon as={InfoIcon} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </FormLabel>
              <Select
                id='type'
                name='type'
                size='sm'
                value={compType}
                onChange={(e) => setCompType(e.target.value)}
              >
                <option value=''>-- Select --</option>
                <option value='application'>Application</option>
                <option value='library'>Library</option>
                <option value='operating-system'>Operating System</option>
                <option value='firmware'>Firmware</option>
                <option value='file'>File</option>
                <option value='device'>Device</option>
                <option value='container'>Container</option>
                <option value='framework'>Framework</option>
                <option value='source'>Source</option>
                <option value='archive'>Archive</option>
                <option value='install'>Install</option>
                <option value='other'>Other</option>
                <option value='unspecified'>Unspecified</option>
              </Select>
            </FormControl>
          )}

          {shortDesc === 'Component has a version' && (
            <FormControl isRequired isDisabled={resolved}>
              <FormLabel>Version</FormLabel>
              <Input
                value={compVersion}
                onChange={(e) => setCompVersion(e.target.value)}
              />
            </FormControl>
          )}

          {isComponentLicense && (
            <LicenseField
              sbomView={false}
              resolved={resolved}
              license={licensesExp || ''}
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Flex
            gap={2}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'flex-end'}
          >
            {!isFreeTier && (
              <Button
                mr={'auto'}
                fontSize={'sm'}
                onClick={handleRuleCreate}
                hidden={!isComponentLicense && !isComponentVersion}
                isDisabled={isInvalidLicense || isEmptyVersion || isDisabled}
                colorScheme={ruleExists ? 'green' : 'blue'}
              >
                {ruleExists ? 'View' : 'Save as'} Rule
              </Button>
            )}

            <Button fontSize={'sm'} onClick={onClose}>
              Close
            </Button>
            <Button
              fontSize={'sm'}
              colorScheme='blue'
              onClick={handleSubmit}
              isDisabled={isInvalidLicense || isEmptyVersion || isDisabled}
              hidden={resolved}
            >
              Save
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CheckModal
