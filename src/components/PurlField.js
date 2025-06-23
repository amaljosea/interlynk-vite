import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext } from 'react'
import IdentifierLabel from 'views/Dashboard/Products/components/IdentifierLabel'

import { Input, InputGroup, useClipboard } from '@chakra-ui/react'
import { FormControl, FormErrorMessage } from '@chakra-ui/react'

import { useRouteFlags } from 'hooks/useRouteFlags'

import CopyButton from './Icons/CopyButton'

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

  const purlString = useClipboard(identifiers?.purl || '')

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
      <InputGroup gap={1}>
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
          placeholder={'e.g. pkg:npm/express@4.17.1'}
        />
        <CopyButton
          size={'md'}
          hasCopied={purlString?.hasCopied}
          onCopy={() => purlString.onCopy()}
          colorScheme={{ copied: 'green', default: 'blue' }}
        />
      </InputGroup>
      <FormErrorMessage>{identifiers?.purlError}</FormErrorMessage>
    </FormControl>
  )
}

export default PurlField
