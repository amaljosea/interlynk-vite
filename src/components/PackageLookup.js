import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useState } from 'react'

import { SearchIcon } from '@chakra-ui/icons'
import { Button, Input, Select, Stack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import { GetPackageData } from 'graphQL/Queries'

import LynkAlert from './LynkAlert'

const ecosystems = ['cargo', 'go', 'pypi', 'maven', 'npm', 'nuget']

const PackageLookup = () => {
  const [lookup, { loading }] = useLazyQuery(GetPackageData)

  const { setTabData } = useContext(TabContext)

  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    ecosystem: '',
    name: '',
    version: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const getLicense = (value) => {
    if (typeof value === 'string') {
      const licenseList = JSON.parse(value)
      if (licenseList?.length > 0) {
        const result = licenseList?.map((item) => ({
          value: item?.spdx_id,
          label: item?.spdx_id
        }))
        return result
      } else {
        return []
      }
    } else {
      console.log('Invalid license')
      return []
    }
  }

  const isInvalid =
    formData?.ecosystem === '' ||
    formData?.name === '' ||
    formData?.version === ''

  const handleSearch = () => {
    lookup({
      variables: {
        name: formData?.name,
        version: formData?.version,
        ecosystem: formData?.ecosystem
      }
    }).then((res) => {
      const { packageLookup } = res?.data || ''
      if (packageLookup?.package) {
        const { package: pkg, packageVersion } = packageLookup || ''
        const license = getLicense(packageVersion.license)
        setTabData((prev) => ({
          ...prev,
          details: {
            ...prev.details,
            name: pkg?.name,
            kind: 'library',
            licenses: license,
            copyright: packageVersion?.copyright,
            version: packageVersion?.version,
            description: pkg?.description
          },
          identifiers: {
            ...prev.identifiers,
            purl: packageVersion?.purl
          }
        }))
        setError('')
      } else {
        setError('Package not found')
      }
    })
  }

  return (
    <Stack spacing={3}>
      {error !== '' && <LynkAlert msg={error} />}
      <FormControl>
        <FormLabel htmlFor='ecosystem'>Ecosystem</FormLabel>
        <Select
          name='ecosystem'
          onChange={handleChange}
          textTransform={'uppercase'}
          value={formData?.ecosystem}
        >
          <option value=''>-- Select --</option>
          {ecosystems?.map((item, index) => (
            <option
              key={index}
              value={item}
              style={{ textTransform: 'uppercase' }}
            >
              {item}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel htmlFor='name'>Name</FormLabel>
        <Input
          name='name'
          fontSize={'sm'}
          value={formData?.name}
          onChange={handleChange}
          placeholder='Enter package name (e.g. Fody)'
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor='version'>Version</FormLabel>
        <Input
          name='version'
          fontSize={'sm'}
          onChange={handleChange}
          value={formData?.version}
          placeholder='Enter package version (e.g 6.8.2)'
        />
      </FormControl>
      <Button
        siz='sm'
        colorScheme='blue'
        isLoading={loading}
        isDisabled={isInvalid}
        onClick={handleSearch}
        loadingText='Loading...'
        leftIcon={<SearchIcon />}
      >
        Search
      </Button>
    </Stack>
  )
}

export default PackageLookup
