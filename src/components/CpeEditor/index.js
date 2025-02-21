import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { validateCpe, validateFields, validateLanguage } from 'utils/cpeUtils'
import IdentifierLabel from 'views/Dashboard/Products/components/IdentifierLabel'

import { FormControl, Stack, Textarea } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'

import CpeField from './CpeField'
import Part from './Part'
import Product from './Product'
import TargetHardware from './TargetHardware'
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

  const updateCpeString = (index, val) => {
    const cpeParts = value?.split(':')
    cpeParts[index] = val === '' ? '*' : val
    const cpe = cpeParts.join(':')
    setValue(cpe)
  }

  const onChange = (name, value, index) => {
    updateCpeString(index, value)
    setCpeData((prev) => ({
      ...prev,
      [name]: value
    }))
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

  const isVendorValid = validateFields(cpeData?.vendor)
  const isProductValid = validateFields(cpeData?.product)
  const isUpdateValid = validateFields(cpeData?.update)
  const isEditionValid = validateFields(cpeData?.edition)
  const isLanguageValid = validateLanguage(cpeData?.language)
  const isSwEditionValid = validateFields(cpeData?.swEdition)
  const isTargetSoftWareValid = validateFields(cpeData?.targetSoftware)
  const isOtherFieldValid = validateFields(cpeData?.other)

  const isInvalid =
    ['part', 'vendor', 'product', 'version'].some((key) => !cpeData?.[key]) ||
    !isLanguageValid ||
    !isEditionValid ||
    !isUpdateValid ||
    !isSwEditionValid ||
    !isTargetSoftWareValid ||
    !isOtherFieldValid ||
    !isVendorValid ||
    !isProductValid

  useEffect(() => {
    if (value) {
      const matches = validateCpe(value)
      if (matches) {
        const allowedValues = ['a', 'h', 'o', 'A', 'H', 'O']
        const components = value.split(':')
        const isValid =
          components[2] && allowedValues.includes(components[2].toLowerCase())

        setCpeData((prev) => ({
          ...prev,
          part: isValid ? components[2].toLowerCase() : prev.part,
          vendor: components[3]?.replace(/\*/g, '') || prev.vendor,
          product: components[4]?.replace(/\*/g, '') || prev.product,
          version: components[5]?.replace(/\*/g, '') || prev.version,
          update: components[6]?.replace(/\*/g, '') || prev.update,
          edition: components[7]?.replace(/\*/g, '') || prev.edition,
          language: components[8].replace(/\*/g, '') || prev.language,
          swEdition: components[9]?.replace(/\*/g, '') || prev.swEdition,
          targetSoftware:
            components[10]?.replace(/\*/g, '') || prev.targetSoftware,
          targetHardware:
            components[11]?.replace(/\*/g, '') || prev.targetHardware,
          other: components[12]?.replace(/\*/g, '') || prev.other
        }))
      }
    }
  }, [value, setCpeData])

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
          variant='filled'
          value={value}
          onChange={(e) => console.log(e.target.value)}
        />
      </FormControl>
      <Part disabled={false} part={cpeData?.part} onChange={onChange} />
      <Vendor
        disabled={false}
        vendor={cpeData?.vendor}
        onChange={onChange}
        isValid={isVendorValid}
      />
      <Product
        disabled={false}
        product={cpeData?.product}
        vendor={cpeData?.vendor}
        onChange={onChange}
        isValid={isProductValid}
      />
      <Version
        disabled={false}
        version={cpeData?.version}
        product={cpeData?.product}
        onChange={onChange}
      />
      {/* UPDATE */}
      <CpeField
        label='Update'
        name='update'
        value={cpeData?.update}
        onChange={onChange}
        isValid={isUpdateValid}
        disabled={false}
        index={6}
      />
      {/* Edition */}
      <CpeField
        label='Edition'
        name='edition'
        value={cpeData?.edition}
        onChange={onChange}
        isValid={isEditionValid}
        disabled={false}
        index={7}
      />
      {/* Language */}
      <CpeField
        label='Language'
        name='language'
        value={cpeData?.language}
        onChange={onChange}
        isValid={isLanguageValid}
        disabled={false}
        index={8}
      />
      {/* SwEdition */}
      <CpeField
        label='SW Edition'
        name='swEdition'
        value={cpeData?.swEdition}
        onChange={onChange}
        isValid={isSwEditionValid}
        disabled={false}
        index={9}
      />
      {/* Target software */}
      <CpeField
        label='Target Software'
        name='targetSoftware'
        value={cpeData?.targetSoftware}
        onChange={onChange}
        isValid={isTargetSoftWareValid}
        disabled={false}
        index={10}
      />
      <TargetHardware
        disabled={false}
        targetHardware={cpeData?.targetHardware}
        onChange={onChange}
      />
      {/* Other */}
      <CpeField
        label='Other'
        name='other'
        value={cpeData?.other}
        onChange={onChange}
        isValid={isOtherFieldValid}
        disabled={false}
        index={12}
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
