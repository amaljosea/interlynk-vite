import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { validateCpe } from 'utils'
import IdentifierLabel from 'views/Dashboard/Products/components/IdentifierLabel'

import { FormControl, Stack, Textarea } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'

import Edition from './Edition'
import Language from './Language'
import Other from './Other'
import Part from './Part'
import Product from './Product'
import SwEdition from './SwEdition'
import TargetHardware from './TargetHardware'
import TargetSoftware from './TargetSoftware'
import Update from './Update'
import Vendor from './Vendor'
import Version from './Version'

const CpeEditor = ({ value, setValue, isOpen, onOpen, onClose }) => {
  const { handleChange } = useContext(TabContext)

  const [cpeData, setCpeData] = useState({
    part: '',
    vendor: '',
    product: '',
    version: '',
    update: '',
    edition: '',
    language: '',
    swEdition: '',
    targetSoftware: '',
    targetHardware: '',
    other: ''
  })

  const onChange = (name, value) => {
    setCpeData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const onBlur = (index, val) => {
    const cpeParts = value?.split(':')
    cpeParts[index] = val === '' ? '*' : val
    const cpe = cpeParts.join(':')
    setValue(cpe)
  }

  const handleSave = () => {
    handleChange('identifiers', 'cpe', value)
    const matches = validateCpe(value)
    if (matches) {
      handleChange('identifiers', 'cpeError', '')
    } else {
      handleChange('identifiers', 'cpeError', 'Invalid CPE')
    }
    onClose()
  }

  const isInvalid = ['part', 'vendor', 'product', 'version'].some(
    (key) => !cpeData?.[key]
  )

  useEffect(() => {
    if (value) {
      const allowedValues = ['a', 'h', 'o', 'A', 'H', 'O']
      const components = value?.split(':')
      const isValid =
        components[2] && allowedValues.includes(components[2].toLowerCase())
      setCpeData(() => ({
        part: isValid ? components[2].toLowerCase() : '',
        vendor: components[3]?.replace(/\*/g, '') || '',
        product: components[4]?.replace(/\*/g, '') || '',
        version: components[5]?.replace(/\*/g, '') || '',
        update: components[6]?.replace(/\*/g, '') || '',
        edition: components[7]?.replace(/\*/g, '') || '',
        language: components[8]?.replace(/\*/g, '') || '',
        swEdition: components[9]?.replace(/\*/g, '') || '',
        targetSoftware: components[10]?.replace(/\*/g, '') || '',
        targetHardware: components[11]?.replace(/\*/g, '') || '',
        other: components[12]?.replace(/\*/g, '') || ''
      }))
    }
  }, [value])

  return (
    <Stack spacing={4}>
      <FormControl isReadOnly>
        <IdentifierLabel
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          title={`CPE`}
        />
        <Textarea
          type='text'
          fontSize='sm'
          variant='filled'
          value={value}
          onChange={(e) => console.log(e.target.value)}
        />
      </FormControl>
      <Part
        disabled={false}
        part={cpeData?.part}
        onBlur={onBlur}
        onChange={onChange}
      />
      <Vendor
        disabled={false}
        vendor={cpeData?.vendor}
        onBlur={onBlur}
        onChange={onChange}
      />
      <Product
        disabled={false}
        product={cpeData?.product}
        onBlur={onBlur}
        onChange={onChange}
      />
      <Version
        disabled={false}
        version={cpeData?.version}
        onBlur={onBlur}
        onChange={onChange}
      />
      <Update
        disabled={false}
        update={cpeData?.update}
        onBlur={onBlur}
        onChange={onChange}
      />
      <Edition
        disabled={false}
        edition={cpeData?.edition}
        onBlur={onBlur}
        onChange={onChange}
      />
      <Language
        disabled={false}
        language={cpeData?.language}
        onBlur={onBlur}
        onChange={onChange}
      />
      <SwEdition
        disabled={false}
        swEdition={cpeData?.swEdition}
        onBlur={onBlur}
        onChange={onChange}
      />
      <TargetSoftware
        disabled={false}
        targetSoftware={cpeData?.targetSoftware}
        onBlur={onBlur}
        onChange={onChange}
      />
      <TargetHardware
        disabled={false}
        targetHardware={cpeData?.targetHardware}
        onBlur={onBlur}
        onChange={onChange}
      />
      <Other
        disabled={false}
        other={cpeData?.other}
        onBlur={onBlur}
        onChange={onChange}
      />
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
          Save CPE
        </Button>
      </ButtonGroup>
    </Stack>
  )
}

export default CpeEditor
