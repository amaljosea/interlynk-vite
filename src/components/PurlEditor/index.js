import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext, useEffect, useState } from 'react'
import IdentifierLabel from 'views/Dashboard/Products/components/IdentifierLabel'

import { FormControl, Stack, Textarea } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'

import Name from './Name'
import Namespace from './Namespace'
import PackageType from './PackageType'
import Qualifiers from './Qualifiers'
import Version from './Version'

const PurlEditor = ({ value, setValue, isOpen, onOpen, onClose }) => {
  const { handleChange } = useContext(TabContext)

  const [purlData, setPurlData] = useState({
    type: '',
    namespace: '',
    name: '',
    version: '',
    qualifiers: ''
  })

  const onChange = (name, value) => {
    setPurlData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const onBlur = (field, val) => {
    try {
      const pkg = PackageURL.fromString(value)
      if (field === 'qualifiers') {
        const convertedObject = {}
        const params = new URLSearchParams(val)
        for (const [key, value] of params) {
          convertedObject[key] = value
        }
        pkg[field] = convertedObject
        setValue(pkg.toString())
      } else {
        pkg[field] = val !== '' ? val : field
        setValue(pkg.toString())
      }
    } catch (error) {
      console.log('Something went wrong', error)
    }
  }

  const handleSave = () => {
    try {
      const pkg = PackageURL.fromString(value)
      pkg.namespace = pkg.namespace === 'namespace' ? '' : pkg.namespace
      pkg.version = pkg.version === 'version' ? '' : pkg.version
      handleChange('identifiers', 'purl', pkg.toString())
      handleChange('identifiers', 'purlError', '')
      setValue(pkg.toString())
      onClose()
    } catch (error) {
      handleChange('identifiers', 'purlError', error?.message)
    }
  }

  const isInvalid =
    ['name', 'type'].some((key) => !purlData?.[key]) ||
    (purlData?.type === 'swift' && !purlData?.namespace)

  useEffect(() => {
    if (value) {
      try {
        const data = PackageURL.fromString(decodeURI(value))
        setPurlData(() => ({
          type: data?.type === 'type' ? '' : data?.type,
          namespace: data?.namespace === 'namespace' ? '' : data?.namespace,
          name: data?.name === 'name' ? '' : data?.name,
          version: data?.version === 'version' ? '' : data?.version,
          qualifiers: data?.qualifiers
            ? Object.entries(data.qualifiers)
                .map(([key, value]) => `${key}=${value}`)
                .join('&')
            : ''
        }))
      } catch (error) {
        console.log('Error', error)
      }
    }
  }, [value])

  return (
    <Stack spacing={4}>
      <FormControl isReadOnly>
        <IdentifierLabel
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          title={`Package URL (PURL)`}
        />
        <Textarea
          type='text'
          value={value}
          fontSize='sm'
          variant='filled'
          onChange={(e) => console.log(e.target.value)}
        />
      </FormControl>
      <PackageType
        disabled={false}
        type={purlData?.type}
        onBlur={onBlur}
        onChange={onChange}
      />
      <Namespace
        disabled={false}
        onBlur={onBlur}
        type={purlData?.type}
        onChange={onChange}
        namespace={purlData?.namespace}
      />
      <Name
        disabled={false}
        onBlur={onBlur}
        type={purlData?.type}
        onChange={onChange}
        name={purlData?.name}
      />
      <Version
        disabled={false}
        onBlur={onBlur}
        type={purlData?.type}
        onChange={onChange}
        version={purlData?.version}
      />
      <Qualifiers
        disabled={false}
        onBlur={onBlur}
        qualifiers={purlData?.qualifiers}
        onChange={onChange}
      />
      <ButtonGroup alignItems={'center'} justifyContent={'flex-end'} gap={2}>
        <Button fontSize={'sm'} onClick={onClose} variant='ghost'>
          Close
        </Button>
        <Button
          fontSize={'sm'}
          variant='outline'
          colorScheme='blue'
          onClick={handleSave}
          isDisabled={isInvalid}
        >
          Save PURL
        </Button>
      </ButtonGroup>
    </Stack>
  )
}

export default PurlEditor
