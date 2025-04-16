import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext, useEffect, useState } from 'react'
import IdentifierLabel from 'views/Dashboard/Products/components/IdentifierLabel'

import { FormControl, Stack, Tag } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'

import Name from './Name'
import Namespace from './Namespace'
import PackageType from './PackageType'
import Qualifiers from './Qualifiers'
import Version from './Version'

const PurlEditor = ({ isOpen, onOpen, onClose, setSavePending }) => {
  const { tabData, setTabData, handleChange } = useContext(TabContext)
  const { identifiers } = tabData || {}

  const [purlData, setPurlData] = useState({
    type: '',
    namespace: '',
    name: '',
    version: '',
    qualifiers: ''
  })

  const TYPE = purlData?.type || ``
  const NAMESPACE = purlData?.namespace ? `/${purlData?.namespace}` : ``
  const NAME = purlData?.name ? `/${purlData?.name}` : ``
  const VERSION = purlData?.version ? `@${purlData?.version}` : ``
  const QUALIFIERS = purlData?.qualifiers ? `?${purlData?.qualifiers}` : ``
  const PURL_STRING = `pkg:${TYPE}${NAMESPACE}${NAME}${VERSION}${QUALIFIERS}`

  const onChange = (name, value) => {
    handleChange('identifiers', 'purl', value)
    setPurlData((prev) => ({
      ...prev,
      [name]: value || ''
    }))
    setTabData((prev) => ({
      ...prev,
      identifiers: {
        ...prev.identifiers,
        purlError: ''
      }
    }))
  }

  const onBlur = (field, inputValue) => {
    setPurlData((prev) => ({
      ...prev,
      [field]: inputValue || ''
    }))
  }

  const handleSave = () => {
    try {
      const pkg = PackageURL.fromString(PURL_STRING)
      setTabData((prev) => ({
        ...prev,
        identifiers: {
          ...prev.identifiers,
          purl: pkg.toString()
        }
      }))
      setSavePending('Click Save to confirm PURL update')
      onClose()
    } catch (error) {
      setTabData((prev) => ({
        ...prev,
        identifiers: {
          ...prev.identifiers,
          purlError: error?.message
        }
      }))
    }
  }

  const isInvalid =
    ['name', 'type'].some((key) => !purlData?.[key]) ||
    ((purlData?.type === 'swift' || purlData?.type === 'maven') &&
      !purlData?.namespace)

  useEffect(() => {
    if (identifiers?.purl !== '') {
      try {
        const data = PackageURL.fromString(decodeURI(identifiers?.purl))
        setPurlData((prev) => ({
          ...prev,
          type: data?.type || '',
          namespace: data?.namespace || '',
          name: data?.name || '',
          version: data?.version || '',
          qualifiers: data?.qualifiers
            ? Object.entries(data.qualifiers)
                .map(([key, value]) => `${key}=${value}`)
                .join('&')
            : ''
        }))
      } catch (error) {
        console.warn('Error', error)
      }
    }
  }, [identifiers?.purl])

  return (
    <Stack spacing={4}>
      <FormControl isReadOnly>
        <IdentifierLabel
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          title={`Package URL (PURL)`}
        />
        {purlData?.type && (
          <Tag mt={2} py={2} w={'fit-content'} wordBreak={'break-all'}>
            {PURL_STRING}
          </Tag>
        )}
      </FormControl>

      <PackageType disabled={false} type={purlData?.type} onChange={onChange} />

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

      {identifiers?.purlError && <LynkAlert msg={identifiers?.purlError} />}

      <ButtonGroup justifyContent={'flex-end'}>
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
