import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'
import { validateEmail } from 'utils/formValidationUtils'
import { componentTypes, infoData, sbomPhases } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import { Button, Flex, Stack, Text, Tooltip } from '@chakra-ui/react'
import { Checkbox, Divider, Input, Textarea } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkDrawer from 'components/LynkDrawer'
import LynkSelect from 'components/LynkSelect'
import LynkFormLabel from 'components/Misc/LynkLabel'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateComponent, sbomCreate, supplierCreate } from 'graphQL/Mutation'
import { GetAllSboms, GetPrimaryComponent } from 'graphQL/Queries'

function ProductSbomDrawer({ sbom, isOpen, onClose }) {
  const params = useParams()
  const { sbomState } = useGlobalState()
  const { showToast } = useCustomToast()
  const { isCustomerView } = useRouteFlags()

  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  // GET PRIMARY COMPONENT
  const { data } = useQuery(GetPrimaryComponent, {
    skip: !isCustomerView && isOpen && sbom?.id ? false : true,
    variables: {
      projectId: params?.productid,
      sbomId: sbom?.id,
      primary: true
    }
  })

  const { nodes } = data?.sbom?.components || ''

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
        description: compDesc
      }
    }).then((res) => {
      if (res?.data) {
        handleSave(id)
      }
    })
  }

  const onCreateSBOM = () => {
    const lifecycles =
      phases?.length > 0 ? phases?.map((item) => ({ name: item?.value })) : []

    const license = sbomState?.expLicense
      ? { licensesExp: sbomState?.expLicense }
      : undefined
    createSbom({
      variables: {
        projectId: productId,
        spec: 'cyclonedx',
        specVersion: '1.4',
        format: 'json',
        phases: lifecycles,
        licenses: license
      }
    }).then((res) => {
      if (res.data.sbomCreate.errors.length === 0) {
        setCompVersion('')
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
    skip: isCustomerView,
    variables: {
      id: productId
    }
  })

  if (allSboms) {
    const result = allSboms?.project?.sboms?.map((item) => item?.projectVersion)
    SBOMs = result
  }

  const invalidVersion = compVersion !== '' && SBOMs?.includes(compVersion)

  const isLoading = sbomLoading || compLoading || supLoading

  const isInvalid =
    compKind === '' ||
    compName === '' ||
    compVersion === '' ||
    formData?.name === '' ||
    isInvalidSupplier ||
    containsSpace ||
    isInvalidEmail

  useEffect(() => {
    if (sbom) {
      if (sbom?.phases?.length > 0) {
        setPhases(() =>
          sbom?.phases?.map((item) => ({ label: item, value: item }))
        )
      }
      if (sbom?.suppliers?.length > 0) {
        setFormData({
          name: sbom?.suppliers[0]?.name || '',
          url: sbom?.suppliers[0]?.url || '',
          contactName: sbom?.suppliers[0]?.contactName || '',
          contactEmail: sbom?.suppliers[0]?.contactEmail || ''
        })
      }
    }
  }, [sbom])

  useEffect(() => {
    if (nodes?.length > 0) {
      const component = nodes[0]
      setInterval(component?.internal)
      setCompName(component?.name || '')
      setCompKind(component?.kind || '')
      setCompScope(component?.scope || '')
      setGroupInfo(component?.group || '')
      setCompDesc(component?.description || '')
    }
  }, [nodes])

  const scopeOptions = [
    { label: '-- Select --', value: '' },
    { label: 'Excluded', value: 'excluded' },
    { label: 'Optional', value: 'optional' },
    { label: 'Required', value: 'required' }
  ]

  return (
    <>
      <LynkDrawer
        title={'Build Version'}
        isOpen={isOpen}
        onClose={onClose}
        noFooter
      >
        <Stack direction={'column'} spacing={4} pt={2} pb={4}>
          {/* Name */}
          <FormControl isRequired isReadOnly={isCustomerView}>
            <LynkFormLabel
              label='Name'
              htmlFor='compName'
              info={onCheck(`Component Name`)}
            />
            <Input
              size='md'
              fontSize={'sm'}
              placeholder='Enter name'
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
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
              size='md'
              placeholder='Add description'
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
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
              htmlFor='compVersion'
              info={onCheck(`Component Version`)}
            />
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
          <FormControl isReadOnly={isCustomerView}>
            <LynkFormLabel
              label='Group'
              htmlFor='groupInfo'
              info={onCheck(`Component Group`)}
            />
            <Input
              size='md'
              fontSize={'sm'}
              placeholder='Add group'
              value={groupInfo}
              onChange={(e) => setGroupInfo(e.target.value)}
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
              id='componentType'
              name='componentType'
              value={
                componentTypes.find((item) => item.value === compKind) || ''
              }
              isDisabled={isCustomerView}
              onChange={(selectedOption) => setCompKind(selectedOption?.value)}
              options={componentTypes}
              dropDown={true}
            />
          </FormControl>
          {/* PHASES */}
          <FormControl hidden={isCustomerView}>
            <LynkFormLabel
              label='Phases'
              htmlFor='compPhases'
              info={onCheck(`SBOM Phases`)}
            />
            <LynkSelect
              isMulti={true}
              value={phases}
              name='compPhases'
              isClearable={true}
              isSearchable={true}
              options={sbomPhases}
              onChange={onPhaseChange}
              placeholder={'Add phase'}
              dropDown={phases.length === 0}
            />
          </FormControl>
          {/* LICENSES */}
          <LicenseField
            sbomView={true}
            isDisabled={isCustomerView}
            license={sbom ? sbom.licensesExp : null}
          />
          {/* SCOPE */}
          <FormControl>
            <LynkFormLabel
              label='Scope'
              htmlFor='compScope'
              info={onCheck(`Component Scope`)}
            />
            <LynkSelect
              id='compScope'
              name='compScope'
              value={scopeOptions.find((opt) => opt.value === compScope)}
              isDisabled={isCustomerView}
              onChange={(selected) => setCompScope(selected?.value || '')}
              options={scopeOptions}
              dropDown
            />
          </FormControl>
          {/* SUPPLIER */}
          <Stack>
            <Text fontWeight={'semibold'}>Supplier Details</Text>
            <Divider />
          </Stack>
          {/* ORG NAME */}
          <FormControl isRequired>
            <FormLabel>Organization Name</FormLabel>
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
            <FormLabel>URL</FormLabel>
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
            <FormLabel>Contact Name</FormLabel>
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
            <FormLabel>Contact Email</FormLabel>
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
          <FormControl isReadOnly={isCustomerView} isDisabled>
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
          <FormControl isReadOnly={isCustomerView}>
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
            isLoading={isLoading}
            width={'fit-content'}
            isDisabled={isInvalid}
            onClick={onCreateSBOM}
          >
            Save
          </Button>
        </Stack>
      </LynkDrawer>
    </>
  )
}

export default ProductSbomDrawer
