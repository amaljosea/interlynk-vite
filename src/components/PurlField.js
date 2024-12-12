import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext } from 'react'
import { isCustomerView } from 'utils'
import IdentifierLabel from 'views/Dashboard/Products/components/IdentifierLabel'

import { Input } from '@chakra-ui/react'
import { FormControl, FormErrorMessage } from '@chakra-ui/react'

const PurlField = ({ isOpen, onOpen, onClose }) => {
  const customerView = isCustomerView()
  const { tabData, handleChange } = useContext(TabContext)
  const { identifiers } = tabData || ''

  const onChange = (e) => {
    const { value } = e.target
    const inputValue = value?.trim()
    handleChange('identifiers', 'purl', inputValue)
    handleChange('identifiers', 'purlError', '')
  }

  const onBlur = (e) => {
    if (e.target.value !== '') {
      try {
        PackageURL.fromString(e.target.value)
        handleChange('identifiers', 'purlError', '')
      } catch (ex) {
        console.error('ex', ex.message)
        handleChange('identifiers', 'purlError', ex.message)
      }
    }
  }

  return (
    <FormControl
      isDisabled={customerView}
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
