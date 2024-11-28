import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { getSignedUrlParams } from 'utils'

import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Textarea
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useSelect } from 'hooks/useSelect'

import { CustomVulnCreate } from 'graphQL/Mutation'
import { GetAllComponents } from 'graphQL/Queries'
import { GetTotalComponents } from 'graphQL/Queries'
import { CveLookup } from 'graphQL/Queries'

import { FaBug } from 'react-icons/fa6'

const severities = ['Critical', 'High', 'Medium', 'Low', 'Unknown']

const CustomVuln = ({ isOpen, onClose }) => {
  const params = useParams()
  const { style } = useSelect('field')
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
  const [lookup] = useLazyQuery(CveLookup)
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

  const [error, setError] = useState('')
  const [cve, setCve] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [cveList, setCveList] = useState([])
  const [formData, setFormData] = useState({
    vulnIdentifier: undefined,
    desc: undefined,
    sev: undefined,
    purl: undefined,
    cpe: undefined,
    componentId: undefined,
    reportedAt: undefined,
    publishedAt: undefined,
    lastModifiedAt: undefined,
    customVulnSbomsAttributes: params?.sbomid
      ? [{ sbomId: params?.sbomid }]
      : undefined
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }))
    setError('')
  }

  const onChangeLookup = (item) => {
    setFormData((prev) => ({
      ...prev,
      vulnIdentifier: item?.value || undefined,
      desc: item?.desc || undefined,
      sev: item?.severity || undefined,
      publishedAt: item?.published || undefined,
      lastModifiedAt: item?.lastModified || undefined
    }))
  }

  const onInputChange = (value) => {
    setSearchText(value)
    if (value !== '') {
      lookup({
        variables: {
          cveId: value
        }
      }).then((res) => {
        const { cveLookup } = res?.data || ''
        if (cveLookup && cveLookup?.length > 0) {
          setCveList(() =>
            cveLookup?.map((item) => ({
              label: item?.cveId,
              value: item?.cveId,
              desc: item?.description,
              severity: item?.severity,
              published: item?.published,
              lastModified: item?.lastModified
            }))
          )
        } else {
          setCveList([{ label: value, value: value }])
        }
      })
    } else {
      setCveList([])
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

  const handleSubmit = async () => {
    await createVuln({ variables: formData }).then((res) => {
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

  useEffect(() => {
    if (components) {
      const component = components?.nodes?.find(
        (item) => item?.primary === true
      )
      setFormData((prev) => ({
        ...prev,
        componentId: component?.id
      }))
    }
  }, [components])

  return (
    <LynkModal
      Icon={FaBug}
      isOpen={isOpen}
      onClose={onClose}
      buttonText={'Save'}
      isLoading={loading}
      onSubmit={handleSubmit}
      hidden={signedUrlParams}
      title='Add Custom Vulerability'
    >
      <Stack spacing={4}>
        <FormControl>
          <FormLabel htmlFor='cveLookup' fontSize={12}>
            CVE Lookup {`( Coming soon )`}
          </FormLabel>
          {/* <ReactSelect
            name='license'
            styles={style}
            className='react-select'
            isClearable={true}
            isSearchable={true}
            isDisabled={signedUrlParams}
            isLoading={loading}
            noOptionsMessage={() => `Please search...`}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            }}
            value={cve}
            options={cveList}
            inputValue={searchText}
            onChange={onChangeLookup}
            onInputChange={onInputChange}
            placeholder={'Search for CVE'}
            filterOption={null}
          /> */}
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor='vulnIdentifier' fontSize={12}>
            Identifier
          </FormLabel>
          <Input
            fontSize={'sm'}
            name='vulnIdentifier'
            placeholder='Ex. CVE-2024-1234'
            value={formData?.vulnIdentifier}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='desc' fontSize={12}>
            Description
          </FormLabel>
          <Textarea
            name='desc'
            fontSize={'sm'}
            value={formData?.desc}
            onChange={handleChange}
            placeholder='Ex. Testing'
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='sev' fontSize={12}>
            Severity
          </FormLabel>
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
          <FormLabel mb={1} htmlFor='reportedAt' fontSize={12}>
            Reported At
          </FormLabel>
          <LynkDate
            value={formData?.reportedAt}
            onChange={(newDate) => handleDateChange('reportedAt', newDate)}
          />
        </FormControl>
        <FormControl>
          <FormLabel mb={1} htmlFor='publishedAt' fontSize={12}>
            Published At
          </FormLabel>
          <LynkDate
            value={formData?.publishedAt}
            onChange={(newDate) => handleDateChange('publishedAt', newDate)}
          />
        </FormControl>
        <FormControl>
          <FormLabel mb={1} htmlFor='lastModifiedAt' fontSize={12}>
            Last Modified At
          </FormLabel>
          <LynkDate
            value={formData?.lastModifiedAt}
            onChange={(newDate) => handleDateChange('lastModifiedAt', newDate)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='purl' fontSize={12}>
            PURL
          </FormLabel>
          <Input
            name='purl'
            fontSize={'sm'}
            value={formData?.purl}
            onChange={handleChange}
            placeholder='Ex. pkg:npm/example-package@1.0.0?platform=linux#src'
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='cpe' fontSize={12}>
            CPE
          </FormLabel>
          <Input
            name='cpe'
            fontSize={'sm'}
            value={formData?.cpe}
            onChange={handleChange}
            placeholder='Ex. cpe:2.3:a:examplevendor:uniqueproduct:1.0.0:*:*:*:*:*:*:*'
          />
        </FormControl>
        {!compLoading && (
          <FormControl>
            <FormLabel htmlFor='componentId' fontSize={12}>
              Component
            </FormLabel>
            <Select
              fontSize={'sm'}
              name='componentId'
              value={formData?.componentId}
              onChange={handleChange}
            >
              <option value=''>-- Select --</option>
              {[...components.nodes]
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
        {error !== '' && <LynkAlert msg={error} />}
      </Stack>
    </LynkModal>
  )
}

export default CustomVuln
