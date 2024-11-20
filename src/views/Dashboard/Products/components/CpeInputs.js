import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useRef, useState } from 'react'
import { validateCpe } from 'utils'

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Select,
  Stack,
  Textarea
} from '@chakra-ui/react'

import CpeInput from 'components/CpeInput'

import { CpeAutoComplete } from 'graphQL/Queries'

import IdentifierLabel from './IdentifierLabel'

const CpeInputs = ({ onClose, value, setValue }) => {
  const { handleChange } = useContext(TabContext)

  const [cpeData, setCpeData] = useState({
    part: '',
    vendor: '',
    product: '',
    cpeVersion: '',
    update: '',
    edition: '',
    language: '',
    swEdition: '',
    targetSoftware: '',
    targetHardware: '',
    other: ''
  })

  const vendorRef = useRef()
  const productRef = useRef()
  const versionRef = useRef()
  const [vendorList, setVendorList] = useState([])
  const [productList, setProductList] = useState([])
  const [versionList, setVersionList] = useState([])

  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const isInvalid =
    cpeData?.part === '' ||
    cpeData?.vendor === '' ||
    cpeData?.product === '' ||
    cpeData?.cpeVersion === ''

  const handleInputChange = (field, value) => {
    setCpeData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputBlur = (index, val) => {
    const cpeParts = value?.split(':')
    cpeParts[index] = val === '' ? '*' : val
    const cpe = cpeParts.join(':')
    setValue(cpe)
  }

  // ON CPE SAVE
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

  // ON VENDOR INPUT CHANGE
  const onVendorInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    if (!val.includes('*') && !value.includes(':')) {
      setCpeData((prev) => ({ ...prev, vendor: val }))
      if (val !== '') {
        getCpe({
          variables: {
            input: {
              idType: 'cpe',
              ecosystem: 'cpe',
              search: {
                vendor: val
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setVendorList(res.data.idAutoComplete.result)
          }
        })
      }
    }
  }

  // ON PRODUCT INPUT CHANGE
  const onProductInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    if (!val.includes('*') && !val.includes(':')) {
      setCpeData((prev) => ({ ...prev, product: val }))
      if (val !== '') {
        getCpe({
          variables: {
            input: {
              idType: 'cpe',
              ecosystem: 'cpe',
              search: {
                product: val
              },
              hints: {
                cpe: {
                  vendor: cpeData?.vendor
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setProductList(res.data.idAutoComplete.result)
          }
        })
      }
    }
  }

  // ON VERSION INPUT CHANGE
  const onVersionInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    if (!val.includes('*') && !val.includes(':')) {
      setCpeData((prev) => ({ ...prev, cpeVersion: val }))
      if (val !== '') {
        getCpe({
          variables: {
            input: {
              idType: 'cpe',
              ecosystem: 'cpe',
              search: {
                version: val
              },
              hints: {
                cpe: {
                  vendor: cpeData?.vendor,
                  product: cpeData?.product
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setVersionList(res.data.idAutoComplete.result)
          }
        })
      }
    }
  }

  // UPDATE FIELDS DATA FROM API
  useEffect(() => {
    if (value) {
      const allowedValues = ['a', 'h', 'o', 'A', 'H', 'O']
      const components = value?.split(':')
      const isValid =
        components[2] && allowedValues.includes(components[2].toLowerCase())
      setCpeData((prev) => ({
        ...prev,
        part: isValid ? components[2].toLowerCase() : '',
        vendor: components[3]?.replace(/\*/g, '') || '',
        product: components[4]?.replace(/\*/g, '') || '',
        cpeVersion: components[5]?.replace(/\*/g, '') || '',
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
    <Flex width={'100%'} direction={'column'} gap={4}>
      {/* CPE STRING */}
      <FormControl>
        <IdentifierLabel title={`CPE`} onClose={onClose} />
        <Textarea
          type='text'
          isReadOnly
          fontSize='sm'
          variant='filled'
          value={value}
          onChange={(e) => console.log(e.target.value)}
        />
      </FormControl>
      <Grid templateColumns='repeat(1, 1fr)' gap={4}>
        {/* PART */}
        <FormControl>
          <FormLabel htmlFor='type'>Part</FormLabel>
          <Select
            size='md'
            name='part'
            id='part'
            fontSize={'sm'}
            value={cpeData?.part}
            onBlur={(e) => handleInputBlur(2, e.target.value)}
            onChange={(e) => handleInputChange('part', e.target.value)}
          >
            <option value=''>-- Select --</option>
            <option value='a'>Application</option>
            <option value='o'>Operating System</option>
            <option value='h'>Hardware</option>
          </Select>
        </FormControl>
        {/* VENDOR */}
        <CpeInput
          name='vendor'
          string={value}
          setString={setValue}
          inputValue={cpeData?.vendor}
          setInputValue={setCpeData}
          cpeList={vendorList}
          setCpeList={setVendorList}
          inputRef={vendorRef}
          validation={false}
          onChange={onVendorInputChange}
        />
        {/* PRODUCT */}
        <CpeInput
          name='product'
          string={value}
          setString={setValue}
          inputValue={cpeData?.product}
          setInputValue={setCpeData}
          cpeList={productList}
          setCpeList={setProductList}
          inputRef={productRef}
          validation={false}
          onChange={onProductInputChange}
        />
        {/* VERSION */}
        <CpeInput
          name='cpeVersion'
          string={value}
          setString={setValue}
          inputValue={cpeData?.cpeVersion}
          setInputValue={setCpeData}
          cpeList={versionList}
          setCpeList={setVersionList}
          inputRef={versionRef}
          validation={false}
          onChange={onVersionInputChange}
        />
        {/* UPDATE */}
        <FormControl>
          <FormLabel>Update</FormLabel>
          <Input
            size='md'
            type='text'
            name='update'
            fontSize={'sm'}
            value={cpeData?.update}
            placeholder='Enter update'
            onBlur={(e) => handleInputBlur(6, e.target.value)}
            onChange={(e) => handleInputChange('update', e.target.value)}
          />
        </FormControl>
        {/* EDITION */}
        <FormControl>
          <FormLabel>Edition</FormLabel>
          <Input
            type='text'
            size='md'
            fontSize={'sm'}
            value={cpeData?.edition}
            placeholder='Enter edition'
            onBlur={(e) => handleInputBlur(7, e.target.value)}
            onChange={(e) => handleInputChange('edition', e.target.value)}
          />
        </FormControl>
        {/* LANGUAGE */}
        <FormControl>
          <FormLabel>Language</FormLabel>
          <Input
            type='text'
            size='md'
            fontSize={'sm'}
            value={cpeData?.language}
            placeholder='Enter language'
            onBlur={(e) => handleInputBlur(8, e.target.value)}
            onChange={(e) => handleInputChange('language', e.target.value)}
          />
        </FormControl>
        {/* SW EDITION */}
        <FormControl>
          <FormLabel>SW Edition</FormLabel>
          <Input
            type='text'
            size='md'
            fontSize={'sm'}
            value={cpeData?.swEdition}
            placeholder='Enter sw edition'
            onBlur={(e) => handleInputBlur(9, e.target.value)}
            onChange={(e) => handleInputChange('swEdition', e.target.value)}
          />
        </FormControl>
        {/* TARGET SOFTWARE */}
        <FormControl>
          <FormLabel>Target Software</FormLabel>
          <Input
            size='md'
            type='text'
            fontSize={'sm'}
            value={cpeData?.targetSoftware}
            placeholder='Enter target software'
            onBlur={(e) => handleInputBlur(10, e.target.value)}
            onChange={(e) =>
              handleInputChange('targetSoftware', e.target.value)
            }
          />
        </FormControl>
        {/* TARGET HARDWARE */}
        <FormControl>
          <FormLabel htmlFor='targetHardware'>Target Hardware</FormLabel>
          <Stack direction='column' spacing={1}>
            <Select
              size='md'
              fontSize={'sm'}
              name='targetHardware'
              value={cpeData?.targetHardware}
              onBlur={(e) => handleInputBlur(11, e.target.value)}
              onChange={(e) =>
                handleInputChange('targetHardware', e.target.value)
              }
            >
              <option value=''>-- Select --</option>
              <option value='x64'>x64</option>
              <option value='x86'>x86</option>
              <option value='x32'>x32</option>
              <option value='arm64'>arm64</option>
              <option value='amd64'>amd64</option>
              <option value='itanium'>itanium</option>
              <option value='arm'>arm</option>
              <option value='rj45'>rj45</option>
              <option value='iphone'>iphone</option>
              <option value='android'>android</option>
              <option value='*'>*</option>
            </Select>
          </Stack>
        </FormControl>
        {/* OTHERE */}
        <FormControl>
          <FormLabel>Other</FormLabel>
          <Input
            size='md'
            type='text'
            fontSize={'sm'}
            value={cpeData?.other}
            placeholder='Enter other'
            onBlur={(e) => handleInputBlur(12, e.target.value)}
            onChange={(e) => handleInputChange('other', e.target.value)}
          />
        </FormControl>
      </Grid>
      <Flex alignItems={'center'} justifyContent={'flex-end'} gap={2}>
        <Button title='Close' fontSize={'sm'} onClick={onClose} variant='ghost'>
          Close
        </Button>
        <Button
          title='Save CPE'
          fontSize={'sm'}
          variant='outline'
          colorScheme='blue'
          onClick={handleSave}
          isDisabled={isInvalid}
        >
          Save CPE
        </Button>
      </Flex>
    </Flex>
  )
}

export default CpeInputs
