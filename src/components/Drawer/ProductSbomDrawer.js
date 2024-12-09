import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isCustomerView, transformLicenseString } from 'utils'
import { hasWhiteSpace, validateUrl } from 'utils'
import { componentTypes, infoData, sbomPhases } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'
import { Button, Flex, Stack, Text, Tooltip, chakra } from '@chakra-ui/react'
import { Checkbox, Input, Select, Textarea } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateComponent, sbomCreate, supplierCreate } from 'graphQL/Mutation'
import { GetAllSboms, GetPrimaryComponent } from 'graphQL/Queries'

function ProductSbomDrawer({ id, isOpen, onClose }) {
  const params = useParams()
  const { prodCompState } = useGlobalState()
  const { showToast } = useCustomToast()
  const customerView = isCustomerView()

  const { field, direction } = prodCompState

  const { primaryErrorColor, primaryBlueText } = useThemeColor([
    'primaryErrorColor',
    'primaryBlueText'
  ])

  // GET PRIMARY COMPONENT
  const { data } = useQuery(GetPrimaryComponent, {
    skip: !customerView && isOpen && id ? false : true,
    variables: {
      projectId: params?.productid,
      sbomId: id,
      primary: true,
      field,
      direction
    }
  })

  const { nodes } = data?.sbom?.components || ''

  const { tabData, saveChanges } = useContext(TabContext)
  const { details } = tabData

  const productId = params.productid

  const [phases, setPhases] = useState([])
  const [groupInfo, setGroupInfo] = useState('')
  const [compName, setCompName] = useState('')
  const [compDesc, setCompDesc] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compKind, setCompKind] = useState('')
  const [compScope, setCompScope] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const initialData = useMemo(
    () => ({
      name: '',
      url: '',
      contactName: '',
      contactEmail: ''
    }),
    []
  )

  const [formData, setFormData] = useState(initialData)
  const [isValidUrl, setIsValidUrl] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const containsSpace = hasWhiteSpace(formData?.url)

  const isInvalidSupplier = formData?.url !== '' && !validateUrl(formData?.url)
  const isInvalidEmail =
    formData?.contactEmail !== '' && !validateEmail(formData?.contactEmail)

  const handleCheckUrl = () => {
    if (isInvalidSupplier) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const handleCheckEmail = () => {
    if (isInvalidEmail) {
      setError('Please enter a valid email')
    }
  }

  const [createSupplier, { loading: supLoading }] = useMutation(supplierCreate)
  const [createSbom, { loading: sbomLoading }] = useMutation(sbomCreate)
  const [createComponent, { loading: compLoading }] =
    useMutation(CreateComponent)

  const handleSave = (id) => {
    createSupplier({
      variables: {
        sbomId: id,
        url: formData?.url,
        name: formData?.name,
        contactName: formData?.contactName,
        contactEmail: formData?.contactEmail
      }
    }).then((res) => {
      if (res?.data) {
        showToast({
          description: 'SBOM added successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  const onPhaseChange = (value) => {
    setPhases(value)
  }
  const handleCreateComp = async (id) => {
    const hasLicense = details?.licenses?.length > 0
    const isCustomLicense =
      hasLicense && details.licenses[0].type === 'Custom License'

    const license = isCustomLicense
      ? transformLicenseString(details.licenses[0].value)
      : details?.licenses?.[0]?.value || ''

    await createComponent({
      variables: {
        sbomId: id,
        primary: true,
        name: compName,
        kind: compKind,
        scope: compScope,
        group: groupInfo,
        internal: isInternal,
        version: compVersion,
        description: compDesc,
        licenses: { licensesExp: license }
      }
    }).then((res) => {
      if (res?.data) {
        saveChanges()
        handleSave(id)
      }
    })
  }

  const onCreateSBOM = () => {
    const lifecycles =
      phases?.length > 0 ? phases?.map((item) => ({ name: item?.value })) : []

    createSbom({
      variables: {
        projectId: productId,
        spec: 'cyclonedx',
        specVersion: '1.4',
        format: 'json',
        phases: lifecycles
      }
    }).then((res) => {
      if (res.data.sbomCreate.errors.length === 0) {
        handleCreateComp(res?.data?.sbomCreate?.sbom?.id)
      } else {
        showToast({
          description: res.data.sbomCreate.errors,
          status: 'error'
        })
      }
    })
  }

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  let SBOMs = []
  const { data: allSboms } = useQuery(GetAllSboms, {
    fetchPolicy: 'network-only',
    skip: customerView,
    variables: {
      id: productId
    }
  })

  if (allSboms) {
    const result = allSboms?.project?.sboms?.map((item) => item?.projectVersion)
    SBOMs = result
  }

  const invalidVersion = compVersion !== '' && SBOMs?.includes(compVersion)

  const isInvalid =
    compKind === '' ||
    compName === '' ||
    compVersion === '' ||
    formData?.name === '' ||
    isInvalidSupplier ||
    containsSpace ||
    isInvalidEmail

  useEffect(() => {
    if (nodes?.length > 0) {
      setCompName(nodes[0]?.name || '')
      setCompKind(nodes[0]?.kind || '')
    }
  }, [nodes])

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth='1px'>Build Version</DrawerHeader>
          <DrawerBody overflowX={'hidden'}>
            <Stack direction={'column'} spacing={4} pt={2} pb={4}>
              {/* Name */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='compName' fontSize={'sm'}>
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
                  size='md'
                  fontSize={'sm'}
                  placeholder='Enter name'
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                />
              </FormControl>
              {/* Description */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='compDescription' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Description</Text>
                    <Tooltip label={onCheck(`Component Description`)}>
                      <InfoIcon color={primaryBlueText} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Textarea
                  size='md'
                  fontSize={'sm'}
                  placeholder='Add description'
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                />
              </FormControl>
              {/* Version */}
              <FormControl isReadOnly={customerView} isInvalid={invalidVersion}>
                <FormLabel htmlFor='compVersion' fontSize={'sm'}>
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
                  size='md'
                  fontSize={'sm'}
                  placeholder='Enter version'
                  value={compVersion}
                  onChange={(e) => setCompVersion(e.target.value)}
                />
                <FormErrorMessage>
                  This version of the product already exists. Continuing will
                  override one of these versions.
                </FormErrorMessage>
              </FormControl>
              {/* GROUP */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='groupInfo' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Group</Text>
                    <Tooltip label={onCheck(`Component Group`)}>
                      <InfoIcon color={primaryBlueText} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  size='md'
                  fontSize={'sm'}
                  placeholder='Add group'
                  value={groupInfo}
                  onChange={(e) => setGroupInfo(e.target.value)}
                />
              </FormControl>
              {/* KIND */}
              <FormControl>
                <FormLabel htmlFor='componentType' fontSize={'sm'}>
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
                  fontSize={'sm'}
                  value={compKind}
                  id='componentType'
                  name='componentType'
                  isDisabled={customerView}
                  onChange={(e) => setCompKind(e.target.value)}
                  textTransform={'capitalize'}
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
              {/* PHASES */}
              <FormControl hidden={customerView}>
                <FormLabel htmlFor='compPhases' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Phases</Text>
                    <Tooltip label={onCheck(`SBOM Phases`)}>
                      <InfoIcon color={primaryBlueText} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <LynkSelect
                  isMulti={true}
                  value={phases}
                  name='compPhases'
                  isClearable={true}
                  isSearchable={true}
                  options={sbomPhases}
                  onChange={onPhaseChange}
                  placeholder={'Add phase'}
                />
              </FormControl>
              {/* LICENSES */}
              <LicenseField
                sbomView={false}
                isDisabled={customerView}
                license={null}
              />
              {/* SCOPE */}
              <FormControl>
                <FormLabel htmlFor='compScope'>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Scope</Text>
                    <Tooltip label={onCheck(`Component Scope`)}>
                      <InfoIcon color={primaryBlueText} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  id='compScope'
                  name='compScope'
                  size='md'
                  fontSize={'sm'}
                  value={compScope}
                  isDisabled={customerView}
                  onChange={(e) => setCompScope(e.target.value)}
                >
                  <option value='' style={{ background: 'lightgray' }}>
                    -- Select --
                  </option>
                  <option value='excluded'>Excluded</option>
                  <option value='optional'>Optional</option>
                  <option value='required'>Required</option>
                </Select>
              </FormControl>
              {/* SUPPLIER */}
              <Stack>
                <Text>Supplier Details</Text>
                <Divider />
              </Stack>
              {/* ORG NAME */}
              <FormControl isRequired>
                <FormLabel fontSize={'sm'}>Organization Name</FormLabel>
                <Input
                  name='name'
                  fontSize={'sm'}
                  autoComplete='off'
                  onChange={handleChange}
                  value={formData?.name}
                  placeholder='Enter organization name'
                />
              </FormControl>
              {/* ORG URL */}
              <FormControl isInvalid={isInvalidSupplier || containsSpace}>
                <FormLabel fontSize={'sm'}>URL</FormLabel>
                <Input
                  name='url'
                  fontSize={'sm'}
                  autoComplete='off'
                  onChange={handleChange}
                  placeholder='Enter URL'
                  onBlur={handleCheckUrl}
                  value={formData?.url}
                />
                <FormErrorMessage>{isValidUrl}</FormErrorMessage>
              </FormControl>
              {/* SUPPLIER NAME */}
              <FormControl>
                <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
                <Input
                  minLength={4}
                  fontSize={'sm'}
                  maxLength={256}
                  autoComplete='no'
                  name='contactName'
                  onChange={handleChange}
                  value={formData?.contactName}
                  placeholder='Enter supplier name'
                />
              </FormControl>
              {/* SUPPLIER EMAIL */}
              <FormControl isInvalid={isInvalidEmail}>
                <FormLabel fontSize={'sm'}>Contact Email</FormLabel>
                <Input
                  type='email'
                  fontSize={'sm'}
                  autoComplete='off'
                  name='contactEmail'
                  onChange={handleChange}
                  onBlur={handleCheckEmail}
                  value={formData?.contactEmail}
                  placeholder='Enter supplier email'
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
              {/* PRIMARY COMPONENT */}
              <FormControl isReadOnly={customerView} isDisabled>
                <Flex alignItems={'center'} gap={2}>
                  <Checkbox size='sm' colorScheme='blue' defaultChecked={true}>
                    Primary component
                  </Checkbox>
                  <Tooltip label={onCheck(`Primary Component`)}>
                    <InfoIcon fontSize={14} color={primaryBlueText} />
                  </Tooltip>
                </Flex>
              </FormControl>
              {/* INTERNAL COMPONENT */}
              <FormControl isReadOnly={customerView}>
                <Flex alignItems={'center'} gap={2}>
                  <Checkbox
                    size='sm'
                    colorScheme='blue'
                    isChecked={isInternal}
                    onChange={() => setIsInternal(!isInternal)}
                  >
                    Internal component
                  </Checkbox>
                  <Tooltip label={onCheck(`Internal Component`)}>
                    <InfoIcon fontSize={14} color={primaryBlueText} />
                  </Tooltip>
                </Flex>
              </FormControl>
              <Button
                title='Save SBOM'
                colorScheme='blue'
                variant={'outline'}
                width={'fit-content'}
                isDisabled={isInvalid}
                onClick={onCreateSBOM}
                isLoading={sbomLoading || compLoading || supLoading}
              >
                Save
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ProductSbomDrawer
