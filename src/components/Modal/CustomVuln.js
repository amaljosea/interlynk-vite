import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'
import { validateCPEString } from 'utils/cpeUtils'

import { SearchIcon } from '@chakra-ui/icons'
import {
  Divider,
  Flex,
  IconButton,
  Input,
  Select,
  Stack,
  Textarea
} from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { CustomVulnCreate } from 'graphQL/Mutation'
import {
  CveLookup,
  GetAllComponents,
  GetTotalComponents
} from 'graphQL/Queries'

import { FaBug } from 'react-icons/fa6'

const severities = ['Critical', 'High', 'Medium', 'Low', 'Unknown']

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

  const { components } = allComponents?.sbom || ''
  const { nodes } = components || ''

  const [error, setError] = useState('')
  const [cve, setCve] = useState('')
  const [purlError, setPurlError] = useState('')
  const [cpeError, setCpeError] = useState('')
  const [compId, setCompId] = useState('')
  const [formData, setFormData] = useState({
    vulnIdentifier: undefined,
    desc: undefined,
    sev: undefined,
    purl: undefined,
    cpe: undefined,
    reportedAt: undefined,
    publishedAt: undefined,
    lastModifiedAt: undefined
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
    setCve(e.target.value)
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
        const { cveLookup } = res?.data || ''
        if (cveLookup) {
          setFormData((prev) => ({
            ...prev,
            sev: cveLookup?.severity,
            desc: cveLookup?.description,
            vulnIdentifier: cveLookup?.vulnId,
            publishedAt: new Date(cveLookup?.published),
            lastModifiedAt: new Date(cveLookup?.lastModified)
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

  const onChangeComponent = (e) => {
    setCompId(e.target.value)
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

  const isDisabled = error !== '' || purlError !== '' || cpeError !== ''

  useEffect(() => {
    if (components?.nodes?.length > 0) {
      const component = components?.nodes?.find(
        (item) => item?.primary === true
      )
      setCompId(component?.id)
    }
  }, [components])

  return (
    <LynkModal
      Icon={FaBug}
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
            icon={<SearchIcon />}
            isLoading={cveLoading}
            onClick={handleSearch}
          />
        </Flex>
        <Divider />
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
            fontSize={'sm'}
            value={formData?.desc}
            onChange={handleChange}
            placeholder='Ex. Testing'
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='sev'>Severity</FormLabel>
          <Select
            name='sev'
            fontSize={'sm'}
            value={formData?.sev}
            onChange={handleChange}
          >
            <option value=''>-- Select --</option>
            {severities?.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </Select>
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
            <Select
              fontSize={'sm'}
              value={compId}
              name='componentId'
              onChange={onChangeComponent}
            >
              <option value=''>-- Select --</option>
              {[...nodes]
                .sort((a, b) => a?.name?.localeCompare(b?.name))
                .map((item, idx) => (
                  <option key={idx} value={item?.id}>
                    {item?.name}-{item?.version}
                    {item?.primary ? ` [Primary Component]` : ''}
                  </option>
                ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    </LynkModal>
  )
}

export default CustomVuln
