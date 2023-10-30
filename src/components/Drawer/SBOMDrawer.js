import { useState, useEffect } from 'react'
import {
  Flex,
  Button,
  Input,
  Spacer,
  Stack,
  useToast,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  FormLabel,
  Checkbox,
  Divider,
  Text,
  Tag,
  TagLabel,
  TagCloseButton,
  Code,
  FormControl
} from '@chakra-ui/react'
import { useMutation, useQuery } from '@apollo/client'
import { CreateShareLynk } from 'graphQL/Mutation'
import { GetProjectData, GetImages } from 'graphQL/Queries'

import MultiSelect from 'react-select'
import { UpdateShareLynk } from 'graphQL/Mutation'

function SBOMDrawer(props) {
  const toast = useToast()

  const { isOpen, onClose, btnRef, refetch, id, shareUsers, contents } = props

  const { data: allProducts } = useQuery(GetProjectData, {
    variables: {
      first: 10
    }
  })

  const { data: allImages } = useQuery(GetImages, {
    variables: {
      first: 10
    }
  })

  const [shareLynkCreate] = useMutation(CreateShareLynk)
  const [shareLynkUpdate] = useMutation(UpdateShareLynk)

  const [hasEmail, setHasEmail] = useState(true)
  const [hasTerms, setHasTerms] = useState(true)
  const [hasLimitAccess, setHasLimitAccess] = useState(true)

  const [email, setEmail] = useState('')
  const [emailList, setEmailList] = useState([])

  const [selectedImg, setSelectedImg] = useState([])
  const [selectedProd, setSelectedProd] = useState([])
  const [imgIds, setImgIds] = useState([])
  const [productIds, setProductIds] = useState([])

  useEffect(() => {
    if (shareUsers.length > 0 && id) {
      setEmailList(shareUsers)
    }

    // console.log(`contents`, contents)

    if (contents && contents.length > 0) {
      const imgList = contents.filter((item) => item.__typename === 'Image')
      const prodList = contents.filter((item) => item.__typename === 'Project')

      if (imgList.length > 0) {
        const data = imgList.map((item) => {
          return {
            value: item.id,
            label: item.name
          }
        })
        const res = imgList.map((item) => item.id)
        setImgIds(res)
        setSelectedImg(data)
      }

      if (prodList.length > 0) {
        const data = prodList.map((item) => {
          return {
            value: item.id,
            label: item.name
          }
        })
        const res = prodList.map((item) => item.id)
        setProductIds(res)
        setSelectedProd(data)
      }
    }
  }, [id])

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return emailRegex.test(email)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (validateEmail(email) === true) {
        setEmailList((prev) => [email, ...prev])
        setEmail('')
      } else {
        toast({
          description: 'Invalid email !',
          status: 'error',
          position: 'top-right',
          duration: 2000
        })
      }
    }
  }

  // Image List

  const imgList =
    allImages &&
    allImages.images.nodes.map((option) => ({
      value: option.id,
      label: option.name
    }))

  // Product List

  const productList =
    allProducts &&
    allProducts.projects.nodes.map((option) => ({
      value: option.id,
      label: option.name
    }))

  const handleImgChange = (selected) => {
    setSelectedImg(selected)
    const selectedIds = selected.map((option) => option.value) // Extracting IDs
    setImgIds(selectedIds)
  }

  const handleProductChange = (selected) => {
    setSelectedProd(selected)
    const selectedIds = selected.map((option) => option.value) // Extracting IDs
    setProductIds(selectedIds)
  }

  const handleSave = async () => {
    try {
      if (emailList.length === 0) {
        toast({
          description: 'Email is required !',
          status: 'warning',
          duration: 2000,
          isClosable: true,
          position: 'top'
        })
      } else if (imgIds.length === 0 && productIds.length === 0) {
        toast({
          description: 'Missing required products and images',
          status: 'warning',
          duration: 2000,
          isClosable: true,
          position: 'top'
        })
      } else {
        await shareLynkCreate({
          variables: {
            enabled: true,
            emails: emailList,
            projects: productIds,
            images: imgIds
          }
        }).then((res) => {
          console.log(`Res`, res)
          refetch()
          setEmailList([])
          setSelectedImg([])
          setSelectedProd([])
          onClose()
        })
      }
    } catch (error) {
      console.log(`Error `, error)
    }
  }

  const handleUpdate = async () => {
    try {
      if (emailList.length === 0) {
        toast({
          description: 'Email is required !',
          status: 'warning',
          duration: 2000,
          isClosable: true,
          position: 'top'
        })
      } else if (imgIds.length === 0 && productIds.length === 0) {
        toast({
          description: 'Missing required products and images',
          status: 'warning',
          duration: 2000,
          isClosable: true,
          position: 'top'
        })
      } else {
        await shareLynkUpdate({
          variables: {
            shareLynkId: id,
            emails: emailList,
            projects: productIds,
            images: imgIds
          }
        }).then((res) => {
          console.log(`Res`, res)
          refetch()
          setEmailList([])
          setSelectedImg([])
          setSelectedProd([])
          onClose()
        })
      }
    } catch (error) {
      console.log(`Error `, error)
    }
  }

  const handleRemove = (item) => {
    const updatedList = emailList.filter((email) => email !== item)
    setEmailList(updatedList)
  }

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='sm'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          Share Lynk
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing={5}>
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='product' fontSize='base' color='gray.600'>
                Image
              </FormLabel>
              <MultiSelect
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: state.isFocused ? 'inherit' : 'inherit',
                    '&:hover': {
                      borderColor: '#CBD5E0'
                    }
                  })
                }}
                isMulti
                value={selectedImg}
                options={imgList}
                onChange={handleImgChange}
              />
            </FormControl>
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='product' fontSize='sm' color='gray.600'>
                Product
              </FormLabel>
              <MultiSelect
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: state.isFocused ? 'inherit' : 'inherit',
                    '&:hover': {
                      borderColor: '#CBD5E0'
                    }
                  })
                }}
                isMulti
                value={selectedProd}
                options={productList}
                onChange={handleProductChange}
              />
            </FormControl>
          </Stack>
          <Box my={6}>
            <Text fontSize='md'>LINK OPTIONS</Text>
            <Divider />
          </Box>
          <Stack spacing='12px'>
            <Text fontSize='sm'>SBOM Access</Text>
            <Text fontSize='xs' color='gray.500'>
              Control access of SBOM with this link
            </Text>
            <Checkbox
              isChecked={hasEmail}
              onChange={(e) => setHasEmail(e.target.checked)}
              mt='10px'
              size='sm'
              colorScheme='blue'
              color='gray.500'
            >
              Requires email confirmation
            </Checkbox>
            <Checkbox
              isChecked={hasTerms}
              onChange={(e) => setHasTerms(e.target.checked)}
              size='sm'
              colorScheme='blue'
              color='gray.500'
            >
              Requires agreeing to terms
            </Checkbox>
            <Checkbox
              isChecked={hasLimitAccess}
              onChange={(e) => setHasLimitAccess(e.target.checked)}
              size='sm'
              colorScheme='blue'
              color='gray.500'
            >
              Limit access to:{' '}
            </Checkbox>

            <Input
              placeholder='Enter email address'
              size='md'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              fontSize={'sm'}
              borderColor={'hsl(0, 0%, 80%)'}
            />
            <Text fontSize={'xs'}>
              Press <Code colorScheme={'blue'}>enter</Code> to add emails
            </Text>
            <Flex
              direction={'row'}
              alignItems={'start'}
              gap={3}
              flexWrap={'wrap'}
            >
              {emailList.map((item) => (
                <Tag
                  size='md'
                  key={item}
                  borderRadius='full'
                  colorScheme={'blue'}
                >
                  <TagLabel>{item}</TagLabel>
                  <TagCloseButton onClick={() => handleRemove(item)} />
                </Tag>
              ))}
            </Flex>
            <Spacer />
          </Stack>
        </DrawerBody>
        <DrawerFooter borderTopWidth='1px'>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          {id ? (
            <Button colorScheme='blue' onClick={handleUpdate}>
              Update
            </Button>
          ) : (
            <Button colorScheme='blue' onClick={handleSave}>
              Save
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default SBOMDrawer
