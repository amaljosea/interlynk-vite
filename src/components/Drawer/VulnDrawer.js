import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Button,
  Center,
  Input,
  Select,
  Spinner,
  Stack,
  Tag,
  Text,
  Textarea
} from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { CustomVulnUpdate } from 'graphQL/Mutation'
import {
  GetAllComponents,
  GetTotalComponents,
  verfifyCustomVuln
} from 'graphQL/Queries'

const severities = ['Critical', 'High', 'Medium', 'Low', 'Unknown']

const VulnDrawer = ({ data, isOpen, onClose }) => {
  const params = useParams()
  const { showToast } = useCustomToast()
  const { prodCompState } = useGlobalState()

  const { vuln } = data || ''

  const [updateVuln, { loading }] = useMutation(CustomVulnUpdate)
  const { data: vulnData, loading: dataLoading } = useQuery(verfifyCustomVuln, {
    skip: isOpen ? false : true,
    variables: { vulnIdentifier: vuln?.vulnId }
  })

  const { customVuln } = vulnData || {}
  const { customVulnSboms } = customVuln || ''

  const [error, setError] = useState('')
  const [compId, setCompId] = useState('')
  const [formData, setFormData] = useState({
    vulnIdentifier: undefined,
    desc: undefined,
    sev: undefined,
    purl: undefined,
    cpe: undefined,
    componentId: undefined,
    publishedAt: undefined,
    lastModifiedAt: undefined
  })

  const { field, direction } = prodCompState
  const compState = {
    projectId: params?.productid || undefined,
    sbomId: params?.sbomid || undefined,
    field: field,
    direction: direction
  }

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? null : value
    }))
    setError('')
  }

  const onChangeComponent = (e) => {
    setCompId(e.target.value)
    setError('')
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
    const attribute = customVulnSboms?.map((item) => ({
      id: item?.id,
      sbomId: item?.sbomId,
      componentId: compId !== '' ? compId : item?.componentId,
      _destroy: compId === '' ? true : false
    }))
    const output = [{ sbomId: params?.sbomid, componentId: compId }]
    const sbomsAttributes =
      customVulnSboms?.length > 0
        ? attribute
        : compId !== ''
          ? output
          : undefined
    await updateVuln({
      variables: { ...formData, customVulnSbomsAttributes: sbomsAttributes }
    }).then((res) => {
      if (res?.data?.customVulnUpdate?.errors?.length > 0) {
        setError(res?.data?.customVulnUpdate?.errors[0])
      } else {
        showToast({
          description: 'Data updated successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  useEffect(() => {
    if (customVuln) {
      const { customVulnSboms, reportedAt, publishedAt, lastModifiedAt } =
        customVuln || ''
      setFormData((prev) => ({
        ...prev,
        id: customVuln?.id,
        vulnIdentifier: customVuln?.vulnIdentifier || null,
        desc: customVuln?.desc || null,
        sev: customVuln?.sev || null,
        purl: customVuln?.purl || null,
        cpe: customVuln?.cpe || null,
        reportedAt: reportedAt ? new Date(reportedAt) : null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        lastModifiedAt: lastModifiedAt ? new Date(lastModifiedAt) : null
      }))
      if (customVulnSboms?.length > 0) {
        setCompId(customVulnSboms[0]?.componentId)
      }
    }
  }, [customVuln])

  return (
    <Drawer size='sm' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text>Edit Vulnerability</Text>
          {data && <Tag colorScheme='blue'>{vuln?.vulnId}</Tag>}
        </DrawerHeader>
        <DrawerBody>
          {dataLoading ? (
            <Center h={'200px'}>
              <Spinner />
            </Center>
          ) : (
            <Stack spacing={4}>
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
                  textTransform={'capitalize'}
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
                <FormLabel htmlFor='publishedAt'>Published At</FormLabel>
                <LynkDate
                  value={formData?.publishedAt}
                  onChange={(newDate) =>
                    handleDateChange('publishedAt', newDate)
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='lastModifiedAt'>Last Modified At</FormLabel>
                <LynkDate
                  value={formData?.lastModifiedAt}
                  onChange={(newDate) =>
                    handleDateChange('lastModifiedAt', newDate)
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='purl'>PURL</FormLabel>
                <Input
                  name='purl'
                  fontSize={'sm'}
                  value={formData?.purl}
                  onChange={handleChange}
                  placeholder='Ex. pkg:npm/example-package@1.0.0?platform=linux#src'
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='cpe'>CPE</FormLabel>
                <Input
                  name='cpe'
                  fontSize={'sm'}
                  value={formData?.cpe}
                  onChange={handleChange}
                  placeholder='Ex. cpe:2.3:a:examplevendor:uniqueproduct:1.0.0:*:*:*:*:*:*:*'
                />
              </FormControl>
              {!compLoading && nodes ? (
                <FormControl>
                  <FormLabel htmlFor='componentId'>Component</FormLabel>
                  <Select
                    value={compId}
                    fontSize={'sm'}
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
              ) : (
                <Text>Loading components...</Text>
              )}
              {error !== '' && <LynkAlert msg={error} />}
            </Stack>
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button title='Cancel' variant='outline' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            title={'Update'}
            colorScheme='blue'
            isLoading={loading}
            onClick={handleSubmit}
          >
            Update
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default VulnDrawer
