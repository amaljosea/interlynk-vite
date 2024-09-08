import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { components } from 'react-select'
import { errorMapping } from 'utils/errorUtils'

import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import { CreateProjectGroup, UpdateProjectGroup } from 'graphQL/Mutation'
import { GetLabels } from 'graphQL/Queries'

import { BiSolidLayerPlus } from 'react-icons/bi'

const ProductModal = ({ isOpen, onClose, data }) => {
  const { id, name, description, labels: activeLabels } = data || ''
  const [projectGroupCreate] = useMutation(CreateProjectGroup)
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup)

  const { data: prodLabels } = useQuery(GetLabels, {
    skip: isOpen ? false : true,
    variables: { first: 100 }
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

  const labelIds = []
  if (productLabels?.length > 0) {
    productLabels?.map((item) => labelIds?.push(item?.value))
  }

  const updateProduct = async (e) => {
    e.preventDefault()
    await projectGroupUpdate({
      variables: {
        id: id,
        name: productName,
        desc: productDesc,
        labelIds: activeLabels?.map((item) => item?.id)
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
        enabled: true,
        name: productName,
        desc: productDesc
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
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={data ? updateProduct : handleSave}
        title={`${data ? 'Edit' : 'Add'} Product`}
        Icon={BiSolidLayerPlus}
        disabled={isInvalid}
        buttonText={data ? 'Update' : 'Save'}
      >
        <Flex width={'100%'} direction={'column'} gap={4}>
          {error !== '' && (
            <Alert status='error' borderRadius={4}>
              <AlertIcon />
              <Text fontSize={'sm'}>{errorMapping[error] || error}</Text>
            </Alert>
          )}
          <FormControl isRequired>
            <FormLabel fontSize={12}>Name</FormLabel>
            <Input
              type='text'
              value={productName}
              onChange={onNameChange}
              placeholder={`Add product name`}
            />
          </FormControl>
          <FormControl hidden>
            <FormLabel fontSize={12}>Labels</FormLabel>
            <LynkSelect
              isMulti
              components={{
                DropdownIndicator: () => null,
                Option
              }}
              options={options}
              placeholder='Select'
              value={productLabels}
              onChange={(value) => setProductLabels(value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize={12}>Description</FormLabel>
            <Textarea
              rows={5}
              value={productDesc}
              onChange={onDescChange}
              placeholder={`Add product description`}
            />
          </FormControl>
        </Flex>
      </LynkModal>
    </>
  )
}

export default ProductModal
