import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { components } from 'react-select'
import { errorMapping } from 'utils/errorUtils'

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea
} from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { CreateProjectGroup, UpdateProjectGroup } from 'graphQL/Mutation'
import { GetLabels } from 'graphQL/Queries'

const ProductModal = ({ isOpen, onClose, data }) => {
  const { id, name, description, labels: activeLabels } = data || ''
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const [projectGroupCreate] = useMutation(CreateProjectGroup)
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup)

  const { data: prodLabels } = useQuery(GetLabels, {
    skip: isOpen ? false : true
  })
  const { labels } = prodLabels || ''

  const options = []
  labels?.nodes?.map((item) =>
    options.push({
      label: item?.name,
      value: item?.id
    })
  )

  const [productName, setProductName] = useState(name || '')
  const [productDesc, setProductDesc] = useState(description || '')
  const [productLabels, setProductLabels] = useState([])
  const [error, setError] = useState('')

  const labelsAttributes = []
  if (productLabels?.length > 0) {
    productLabels?.map((item) => labelsAttributes?.push({ id: item?.value }))
  }

  const updateProduct = async (e) => {
    e.preventDefault()
    await projectGroupUpdate({
      variables: {
        id: id,
        name: productName,
        desc: productDesc,
        labelsAttributes
      }
    }).then((res) => {
      const error = res?.data?.projectGroupUpdate?.errors
      if (error?.length > 0) {
        setError(res.data.projectGroupUpdate.errors[0])
      } else {
        onClose()
      }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    await projectGroupCreate({
      variables: {
        name: productName,
        desc: productDesc,
        labelsAttributes,
        enabled: true
      }
    }).then((res) => {
      const error = res?.data?.projectGroupCreate?.errors
      if (error?.length > 0) {
        setError(error[0])
      } else {
        onClose()
      }
    })
  }

  const onNameChange = (e) => {
    setProductName(e.target.value)
    setError('')
  }
  const onDescChange = (e) => {
    setProductDesc(e.target.value)
    setError('')
  }

  const Option = (props) => {
    const result = labels?.nodes?.find(
      (item) => item?.name === props.data.label
    )
    return (
      <components.Option {...props}>
        <Flex alignItems={'center'} gap={2}>
          <Box borderRadius={'full'} p={1.5} bg={result?.color}></Box>
          <Text cursor={'pointer'}>{props.data.label}</Text>
        </Flex>
      </components.Option>
    )
  }

  const isInvalid = productName === '' || error !== ''

  useEffect(() => {
    if (activeLabels?.length > 0) {
      const result = []
      activeLabels?.map((item) =>
        result?.push({ label: item?.name, value: item?.id })
      )
      setProductLabels(result)
    }
  }, [activeLabels])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={data ? updateProduct : handleSave}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Add'} Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                {error !== '' && (
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <Text fontSize={'sm'}>{errorMapping[error] || error}</Text>
                  </Alert>
                )}
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type='text'
                    value={productName}
                    onChange={onNameChange}
                    placeholder={`Add product name`}
                  />
                </FormControl>
                <FormControl hidden={!shouldShowDemoFeatures}>
                  <FormLabel>Labels</FormLabel>
                  <LynkSelect
                    isMulti
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                      Option
                    }}
                    options={options}
                    placeholder='Select'
                    value={productLabels}
                    onChange={(value) => setProductLabels(value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    rows={5}
                    value={productDesc}
                    onChange={onDescChange}
                    placeholder={`Add product description`}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='blue' type='submit' disabled={isInvalid}>
                {data ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default ProductModal
