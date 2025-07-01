import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatString, getSignedUrlParams } from 'utils'
import { validateCPEString } from 'utils/cpeUtils'
import { severityList } from 'variables/general'

import {
  Flex,
  IconButton,
  Input,
  Stack,
  Text,
  Textarea
} from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import DividerWithText from 'components/DividerWithText'
import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { CustomVulnCreate } from 'graphQL/Mutation'
import {
  CveLookup,
  GetAllComponents,
  GetTotalComponents
} from 'graphQL/Queries'

import { LuBug, LuSearch } from 'react-icons/lu'

const CustomVuln = ({ isOpen, onClose }) => {
  const params = useParams()
  const { showToast } = useCustomToast()
  const { prodCompState } = useGlobalState()
  const signedUrlParams = getSignedUrlParams()

  const { field, direction } = prodCompState
  const compState = {
    projectId: params?.productid || undefined,
    sbomId: params?.sbomid || undefined,
    field: field,
    direction: direction
  }

  const [createVuln, { loading }] = useMutation(CustomVulnCreate)
  const [lookup, { loading: cveLoading }] = useLazyQuery(CveLookup)
  const { data: compData } = useQuery(GetTotalComponents, {
    skip: isOpen && params?.sbomid ? false : true,
    variables: { ...compState }
  })

  const { data: allComponents, loading: compLoading } = useQuery(
    GetAllComponents,
    {
      skip: isOpen && params?.sbomid ? false : true,
      variables: {
        ...compState,
        first: compData?.sbom?.components?.totalCount
      }
    }
  )

  const { components } = allComponents?.sbom || {}
  const { nodes } = components || {}

  const [error, setError] = useState('')
  const [cve, setCve] = useState('')
  const [purlError, setPurlError] = useState('')
  const [cpeError, setCpeError] = useState('')
  const [compId, setCompId] = useState('')
  const [formData, setFormData] = useState({
    vulnIdentifier: '',
    desc: '',
    sev: '',
    purl: '',
    cpe: '',
    reportedAt: undefined,
    publishedAt: undefined,
    lastModifiedAt: undefined,
    cvssScore: undefined,
    cvssVector: undefined,
    advisories: []
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }))
    name === 'purl' && setPurlError('')
    name === 'cpe' && setCpeError('')
    setError('')
  }

  const handleCveChange = (e) => {
    const { value } = e.target
    setCve(value?.trim())
    setError('')
  }

  const onBlurPurl = (e) => {
    if (e.target.value !== '') {
      try {
        PackageURL.fromString(e.target.value)
        setPurlError('')
      } catch (ex) {
        setPurlError(ex?.message)
      }
    }
  }

  const onBlurCpe = (e) => {
    if (e.target.value !== '') {
      const validation = validateCPEString(e.target.value)
      const { isValid, error } = validation || ''
      setCpeError(isValid ? '' : error)
    }
  }

  const handleSearch = () => {
    if (cve !== '') {
      lookup({ variables: { vulnId: cve } }).then((res) => {
        const { cveLookup } = res?.data || {}
        if (cveLookup) {
          const { reportedAt, published, lastModified, severity, advisories } =
            cveLookup || {}
          setFormData((prev) => ({
            ...prev,
            desc: cveLookup?.description || '',
            vulnIdentifier: cveLookup?.vulnId || '',
            cvssScore: cveLookup?.cvssScore || '',
            cvssVector: cveLookup?.cvssVector || '',
            sev: severity ? severity?.toLowerCase() : '',
            advisories: advisories?.length > 0 ? advisories : [],
            publishedAt: published ? new Date(published) : undefined,
            reportedAt: reportedAt ? new Date(reportedAt) : undefined,
            lastModifiedAt: lastModified ? new Date(lastModified) : undefined
          }))
        } else {
          setError('Data not found')
        }
      })
    } else {
      setError('Please enter a valid CVE ID')
    }
  }

  const handleDateChange = (type, newDate) => {
    const isValidDate = newDate && !isNaN(newDate)
    setFormData((prev) => ({ ...prev, [type]: newDate?._d || undefined }))
    if (newDate && !isValidDate) {
      setError('Please enter a valid date')
    } else {
      setError('')
    }
  }

  const onChangeComponent = (selectedItem) => {
    setCompId(selectedItem.value)
    setError('')
  }

  const handleSubmit = async () => {
    const attribute = {
      sbomId: params?.sbomid,
      componentId: compId !== '' ? compId : undefined
    }
    await createVuln({
      variables: {
        ...formData,
        customVulnSbomsAttributes: compId ? [attribute] : undefined
      }
    }).then((res) => {
      if (res?.data?.customVulnCreate?.errors?.length > 0) {
        setError(res?.data?.customVulnCreate?.errors[0])
      } else {
        showToast({
          description: 'Data added successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  const isDisabled =
    formData?.vulnIdentifier === '' ||
    formData?.desc === '' ||
    error !== '' ||
    purlError !== '' ||
    cpeError !== ''

  useEffect(() => {
    if (components?.nodes?.length > 0) {
      const component = components?.nodes?.find(
        (item) => item?.primary === true
      )
      setCompId(component?.id)
    }
  }, [components])

  const sevOptions = [
    { label: '-- Select --', value: '' },
    ...severityList.map((item) => ({
      label: formatString(item),
      value: item
    }))
  ]
  const compOptions = [
    { label: '-- Select --', value: '' },
    ...(nodes ?? []) // Ensures nodes is always an array
      .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
      .map((item) => ({
        label: `${item?.name}-${item?.version}${item?.primary ? ' [Primary Component]' : ''}`,
        value: item?.id
      }))
  ]

  const CompValue = nodes?.find((item) => item.id === compId)
    ? {
        label: `${nodes?.find((item) => item.id === compId).name}-${
          nodes?.find((item) => item.id === compId).version
        }${nodes?.find((item) => item.id === compId).primary ? ' [Primary Component]' : ''}`,
        value: compId
      }
    : null

  return (
    <LynkModal
      Icon={LuBug}
      isOpen={isOpen}
      onClose={onClose}
      buttonText={'Save'}
      isLoading={loading}
      disabled={isDisabled}
      onSubmit={handleSubmit}
      hidden={signedUrlParams}
      title='Add Custom Vulerability'
    >
      <Stack spacing={4}>
        {error !== '' && <LynkAlert msg={error} />}
        <Text>Fill it up to search or add manually</Text>
        <Flex gap={2} alignItems={'end'}>
          <FormControl>
            <FormLabel htmlFor='cveLookup'>CVE Lookup</FormLabel>
            <Input
              value={cve}
              fontSize={'sm'}
              onChange={handleCveChange}
              _placeholder={{ fontWeight: 300 }}
              placeholder='e.g. GHSA-qppj-fm5r-hxr3'
            />
          </FormControl>
          <IconButton
            siz='sm'
            colorScheme='blue'
            icon={<LuSearch size={18} />}
            isLoading={cveLoading}
            onClick={handleSearch}
          />
        </Flex>
        <DividerWithText text='OR' />
        <FormControl isRequired>
          <FormLabel htmlFor='vulnIdentifier'>Identifier</FormLabel>
          <Input
            fontSize={'sm'}
            name='vulnIdentifier'
            placeholder='Ex. CVE-2024-1234'
            value={formData?.vulnIdentifier}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor='desc'>Description</FormLabel>
          <Textarea
            name='desc'
            value={formData?.desc}
            onChange={handleChange}
            placeholder='Ex. Testing'
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='sev'>Severity</FormLabel>
          <LynkSelect
            name='sev'
            value={
              severityList?.find((item) => item === formData?.sev)
                ? {
                    label: formatString(formData.sev),
                    value: formData.sev
                  }
                : null
            }
            onChange={(selected) =>
              handleChange({ target: { name: 'sev', value: selected.value } })
            }
            options={sevOptions}
            placeholder={'-- Select --'}
            dropDown
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='reportedAt'>Reported At</FormLabel>
          <LynkDate
            value={formData?.reportedAt}
            onChange={(newDate) => handleDateChange('reportedAt', newDate)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='publishedAt'>Published At</FormLabel>
          <LynkDate
            value={formData?.publishedAt}
            onChange={(newDate) => handleDateChange('publishedAt', newDate)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='lastModifiedAt'>Last Modified At</FormLabel>
          <LynkDate
            value={formData?.lastModifiedAt}
            onChange={(newDate) => handleDateChange('lastModifiedAt', newDate)}
          />
        </FormControl>
        <FormControl isInvalid={purlError !== ''}>
          <FormLabel htmlFor='purl'>PURL</FormLabel>
          <Input
            name='purl'
            fontSize={'sm'}
            onBlur={onBlurPurl}
            value={formData?.purl}
            onChange={handleChange}
            placeholder='Ex. pkg:npm/example-package@1.0.0?platform=linux#src'
          />
          <FormErrorMessage>{purlError}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={cpeError !== ''}>
          <FormLabel htmlFor='cpe'>CPE</FormLabel>
          <Input
            name='cpe'
            fontSize={'sm'}
            onBlur={onBlurCpe}
            value={formData?.cpe}
            onChange={handleChange}
            placeholder='Ex. cpe:2.3:a:examplevendor:uniqueproduct:1.0.0:*:*:*:*:*:*:*'
          />
          <FormErrorMessage>{cpeError}</FormErrorMessage>
        </FormControl>
        {!compLoading && nodes && (
          <FormControl>
            <FormLabel htmlFor='componentId'>Component</FormLabel>
            <LynkSelect
              name='componentId'
              value={CompValue}
              onChange={(selected) => onChangeComponent(selected)}
              options={compOptions}
              dropDown
              menuPlacement='top'
              placeholder={'-- Select --'}
            />
          </FormControl>
        )}
      </Stack>
    </LynkModal>
  )
}

export default CustomVuln
