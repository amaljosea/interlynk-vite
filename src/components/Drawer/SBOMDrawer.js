import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import MultiSelect from 'react-select'
import { validateEmail } from 'utils/formValidationUtils'

import {
  Box,
  Button,
  Checkbox,
  Code,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Spacer,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateShareLynk } from 'graphQL/Mutation'
import { UpdateShareLynk } from 'graphQL/Mutation'

function SBOMDrawer(props) {
  const { showToast } = useCustomToast()

  const { isOpen, onClose, id, shareUsers, contents } = props

  const [shareLynkCreate] = useMutation(CreateShareLynk)
  const [shareLynkUpdate] = useMutation(UpdateShareLynk)

  const [hasEmail, setHasEmail] = useState(true)
  const [hasTerms, setHasTerms] = useState(true)
  const [hasLimitAccess, setHasLimitAccess] = useState(true)

  const [email, setEmail] = useState('')
  const [emailList, setEmailList] = useState([])

  const [selectedProd, setSelectedProd] = useState([])
  const [productIds, setProductIds] = useState([])

  const { sameSecondaryText, headingTextColor, headingTextSecondary } =
    useThemeColor([
      'sameSecondaryText',
      'headingTextColor',
      'headingTextSecondary'
    ])
  useEffect(() => {
    if (shareUsers.length > 0 && id) {
      setEmailList(shareUsers)
    }

    if (contents && contents.length > 0) {
      const prodList = contents.filter((item) => item.__typename === 'Project')

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
  }, [contents, id, shareUsers])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (validateEmail(email) === true) {
        setEmailList((prev) => [email, ...prev])
        setEmail('')
      } else {
        showToast({
          description: 'Invalid email !',
          status: 'error'
        })
      }
    }
  }

  // Product List

  // const productList =
  //   allProducts &&
  //   allProducts.projects.nodes.map((option) => ({
  //     value: option.id,
  //     label: option.name
  //   }))

  const productList = []

  const handleProductChange = (selected) => {
    setSelectedProd(selected)
    const selectedIds = selected.map((option) => option.value) // Extracting IDs
    setProductIds(selectedIds)
  }

  const handleSave = async () => {
    try {
      if (productIds.length === 0) {
        showToast({
          description: 'Missing required products',
          status: 'error'
        })
      } else {
        await shareLynkCreate({
          variables: {
            enabled: true,
            emails: emailList,
            projects: productIds
          }
        }).then((res) => {
          console.log(`Res`, res)

          setEmailList([])
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
      if (productIds.length === 0) {
        showToast({
          description: 'Missing required products and images',
          status: 'error'
        })
      } else {
        await shareLynkUpdate({
          variables: {
            shareLynkId: id,
            emails: emailList,
            projects: productIds
          }
        }).then((res) => {
          console.log(`Res`, res)
          setEmailList([])
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
        <DrawerHeader borderBottomWidth='1px'>Share Lynk</DrawerHeader>
        <DrawerBody>
          <FormControl fontSize={'sm'}>
            <FormLabel htmlFor='product' color={headingTextColor}>
              Product
            </FormLabel>
            <MultiSelect
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  borderColor: state.isFocused ? 'inherit' : 'inherit',
                  '&:hover': {
                    borderColor: headingTextSecondary
                  }
                })
              }}
              isMulti
              value={selectedProd}
              options={productList}
              onChange={handleProductChange}
            />
          </FormControl>
          <Box my={6}>
            <Text fontSize='md'>LINK OPTIONS</Text>
            <Divider />
          </Box>
          <Stack spacing='12px'>
            <Text fontSize='sm'>SBOM Access</Text>
            <Text fontSize='xs' color={sameSecondaryText}>
              Control access of SBOM with this link
            </Text>
            <Checkbox
              isChecked={hasEmail}
              onChange={(e) => setHasEmail(e.target.checked)}
              mt='10px'
              size='sm'
              colorScheme='blue'
              color={sameSecondaryText}
            >
              Requires email confirmation
            </Checkbox>
            <Checkbox
              isChecked={hasTerms}
              onChange={(e) => setHasTerms(e.target.checked)}
              size='sm'
              colorScheme='blue'
              color={sameSecondaryText}
            >
              Requires agreeing to terms
            </Checkbox>
            <Checkbox
              isChecked={hasLimitAccess}
              onChange={(e) => setHasLimitAccess(e.target.checked)}
              size='sm'
              colorScheme='blue'
              color={sameSecondaryText}
            >
              Limit access to:{' '}
            </Checkbox>
            <FormControl isInvalid={!validateEmail(email) && email !== ''}>
              <Input
                placeholder='Enter Email Address'
                size='md'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                fontSize={'sm'}
                borderColor={'hsl(0, 0%, 80%)'}
              />
              {email !== '' && !validateEmail(email) && (
                <FormErrorMessage>Email is invalid</FormErrorMessage>
              )}
            </FormControl>
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
          <Button title='Cancel' mr={3} onClick={onClose}>
            Cancel
          </Button>
          {id ? (
            <Button
              title='Update'
              colorScheme='blue'
              onClick={handleUpdate}
              isDisabled={emailList.length === 0}
            >
              Update
            </Button>
          ) : (
            <Button
              title='Save'
              colorScheme='blue'
              onClick={handleSave}
              isDisabled={emailList.length === 0}
            >
              Save
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default SBOMDrawer
