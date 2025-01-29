import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useState } from 'react'

import { SearchIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Input, Stack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import { GetPackageData } from 'graphQL/Queries'

import LynkAlert from './LynkAlert'

const PackageLookup = () => {
  const [lookup, { loading }] = useLazyQuery(GetPackageData)

  const { setTabData } = useContext(TabContext)

  const [pkgString, setPkgString] = useState('')
  const [error, setError] = useState('')

  const onInputChange = (e) => {
    setPkgString(e.target.value)
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

  const handleSearch = () => {
    const result = pkgString?.split(' ')
    if (result?.length === 3) {
      lookup({
        variables: {
          name: result[1] || '',
          version: result[2] || '',
          ecosystem: result[0] || ''
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
    } else {
      setError('Please enter valid package details')
    }
  }

  return (
    <Stack>
      <Flex gap={2} alignItems={'end'}>
        <FormControl>
          <FormLabel>Package</FormLabel>
          <Input
            fontSize={'sm'}
            value={pkgString}
            onChange={onInputChange}
            placeholder='Ecosystem Name Version (e.g. nuget Fody 6.8.2)'
          />
        </FormControl>
        <IconButton
          siz='sm'
          isLoading={loading}
          colorScheme='blue'
          icon={<SearchIcon />}
          onClick={handleSearch}
        />
      </Flex>
      {error !== '' && <LynkAlert msg={error} />}
    </Stack>
  )
}

export default PackageLookup
