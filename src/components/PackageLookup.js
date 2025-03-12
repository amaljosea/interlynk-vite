import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useState } from 'react'

import { SearchIcon } from '@chakra-ui/icons'
import { Button, Input, Stack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import { GetPackageData } from 'graphQL/Queries'

import LynkAlert from './LynkAlert'
import LynkSelect from './LynkSelect'

const ecosystems = [
  { value: '', label: '-- SELECT --' },
  { value: 'cargo', label: 'Cargo' },
  { value: 'go', label: 'Go' },
  { value: 'pypi', label: 'PyPI' },
  { value: 'maven', label: 'Maven' },
  { value: 'npm', label: 'NPM' },
  { value: 'nuget', label: 'NuGet' }
]

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

  const handleSelect = (val) => {
    const { value } = val
    setFormData((prev) => ({ ...prev, ecosystem: value }))
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
      console.warn('Invalid license')
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
        <LynkSelect
          name='ecosystem'
          onChange={handleSelect}
          value={
            ecosystems.find((item) => item.value === formData?.ecosystem) || ''
          }
          options={ecosystems}
          isCreatable={false}
          dropDown={true}
          placeholder={
            ecosystems.find((item) => item.value === formData?.ecosystem)
              ?.label || '--SELECT--'
          }
        />
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
