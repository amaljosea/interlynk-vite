import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext } from 'react'
import IdentifierLabel from 'views/Dashboard/Products/components/IdentifierLabel'

import { Input } from '@chakra-ui/react'
import { FormControl, FormErrorMessage } from '@chakra-ui/react'

import { useRouteFlags } from 'hooks/useRouteFlags'

const PurlField = ({ isOpen, onOpen, onClose }) => {
  const { isCustomerView } = useRouteFlags()
  const { tabData, setTabData } = useContext(TabContext)
  const { identifiers } = tabData || ''

  const onChange = (e) => {
    const { value } = e.target
    const inputValue = value?.trim()
    setTabData((prev) => ({
      ...prev,
      identifiers: {
        ...prev.identifiers,
        purl: inputValue,
        purlError: ''
      }
    }))
  }

  const onBlur = (event) => {
    const { value } = event.target
    if (value !== '') {
      try {
        PackageURL.fromString(value)
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
  }

  return (
    <FormControl
      isDisabled={isCustomerView}
      isInvalid={identifiers?.purl !== '' && identifiers?.purlError !== ''}
    >
      <IdentifierLabel
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        title={`Package URL (PURL)`}
      />
      <Input
        type='text'
        size='md'
        id='purl'
        name='purl'
        fontSize={'sm'}
        autoComplete='off'
        onBlur={onBlur}
        onChange={onChange}
        value={identifiers?.purl}
      />
      <FormErrorMessage>{identifiers?.purlError}</FormErrorMessage>
    </FormControl>
  )
}

export default PurlField
