import { useEffect } from 'react'
import { useState } from 'react'

import { CopyIcon } from '@chakra-ui/icons'
import {
  Alert,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

const CopyModal = ({ isOpen, onClose, product, version }) => {
  const [message, setMessage] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [filteredData, setFilteredData] = useState()
  const data = null

  useEffect(() => {
    if (data) {
      // const prod = data.projects.nodes.find((item) => item.name === product)
      const prod = {}
      // console.log(`filteredData`, prod)
      setFilteredData(prod.name)
      setSelectedProduct(prod.id)
    }
  }, [product])

  const handleSave = (e) => {
    e.preventDefault()
    setMessage(
      `You are about to copy all metadata, components and relationships of SBOM ${product}:${version} to ${filteredData}:${selectedVersion}`
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onClose()
  }

  const Message = () => {
    return (
      <Stack direction={'column'} gap={2}>
        <Text fontSize={'sm'}>{message}</Text>
        <Text fontSize={'sm'}>Are you sure you want to continue ?</Text>
      </Stack>
    )
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={message === '' ? handleSave : handleSubmit}
      title={'Copy SBOM'}
      buttonText={message === '' ? 'Copy' : 'Yes'}
      Icon={CopyIcon}
    >
      <Text mt={2}>
        Copy{' '}
        <strong>
          {product}:{version}
        </strong>{' '}
        SBOM Content to :
      </Text>
      <Flex flexDir={'column'} gap={5} mt={6}>
        {data && (
          <FormControl isRequired>
            <FormLabel fontSize={16}>Product</FormLabel>
            <Select
              name='product'
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              {data.projects.nodes.length > 0 &&
                data.projects.nodes.map((pv, index) => (
                  <option value={pv.id} key={index}>
                    {pv.name}
                  </option>
                ))}
            </Select>
          </FormControl>
        )}

        <FormControl isRequired>
          <FormLabel fontSize={12}>Version</FormLabel>
          <Input
            type='text'
            value={selectedVersion}
            placeholder='Add version'
            onChange={(e) => setSelectedVersion(e.target.value)}
          />
        </FormControl>

        {message !== '' && <LynkAlert msg={<Message />} />}
      </Flex>
    </LynkModal>
  )
}

export default CopyModal
