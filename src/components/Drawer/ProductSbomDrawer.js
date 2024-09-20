import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import React, { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isCustomerView } from 'utils'
import { infoData } from 'variables/general'
import { componentTypes } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  Tooltip,
  chakra
} from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'

import useCustomToast from 'hooks/useCustomToast'

import { CreateComponent, sbomCreate } from 'graphQL/Mutation'
import { GetAllSboms } from 'graphQL/Queries'

function ProductSbomDrawer({ isOpen, onClose, data }) {
  const params = useParams()
  const { showToast } = useCustomToast()
  const customerView = isCustomerView()

  const { tabData, saveChanges } = useContext(TabContext)
  const { details } = tabData

  const productId = params.productid

  const [groupInfo, setGroupInfo] = useState('')
  const [compName, setCompName] = useState('')
  const [compDesc, setCompDesc] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compKind, setCompKind] = useState('')
  const [compScope, setCompScope] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const [createSbom, { loading: sbomLoading }] = useMutation(sbomCreate)
  const [createComponent, { loading: compLoading }] =
    useMutation(CreateComponent)

  const license = details?.licenses?.length > 0 ? details.licenses[0].value : ''
  const handleCreateComp = async (id) => {
    await createComponent({
      variables: {
        sbomId: id,
        primary: true,
        name: compName,
        kind: compKind,
        scope: compScope,
        group: groupInfo,
        internal: isInternal,
        version: compVersion,
        description: compDesc,
        licenses: { licensesExp: license }
      }
    }).then((res) => {
      if (res?.data) {
        saveChanges()
        showToast({
          description: 'SBOM added successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  const onCreateSBOM = () => {
    createSbom({
      variables: {
        projectId: productId,
        spec: 'cyclonedx',
        specVersion: '1.4',
        format: 'json'
      }
    }).then((res) => {
      if (res.data.sbomCreate.errors.length === 0) {
        handleCreateComp(res?.data?.sbomCreate?.sbom?.id)
      } else {
        showToast({
          description: res.data.sbomCreate.errors,
          status: 'error'
        })
      }
    })
  }

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  let SBOMs = []
  const { data: allSboms } = useQuery(GetAllSboms, {
    fetchPolicy: 'network-only',
    skip: customerView,
    variables: {
      id: productId
    }
  })

  if (allSboms) {
    const result = allSboms?.project?.sboms?.map((item) => item?.projectVersion)
    SBOMs = result
  }

  const invalidVersion = compVersion !== '' && SBOMs?.includes(compVersion)

  const isInvalid = compKind === '' || compName === '' || compVersion === ''

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth='1px'>Build Version</DrawerHeader>
          <DrawerBody overflowX={'hidden'}>
            <Stack direction={'column'} spacing={4} pt={2} pb={4}>
              {/* Name */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='compName' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>
                      Name
                      <chakra.span color={'red.500'} ml={1}>
                        *
                      </chakra.span>
                    </Text>
                    <Tooltip label={onCheck(`Component Name`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  size='md'
                  fontSize={'sm'}
                  placeholder='Enter name'
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                />
              </FormControl>
              {/* Description */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='compDescription' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Description</Text>
                    <Tooltip label={onCheck(`Component Description`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Textarea
                  size='md'
                  fontSize={'sm'}
                  placeholder='Add description'
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                />
              </FormControl>
              {/* Version */}
              <FormControl isReadOnly={customerView} isInvalid={invalidVersion}>
                <FormLabel htmlFor='compVersion' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>
                      Version{' '}
                      <chakra.span color={'red.500'} ml={1}>
                        *
                      </chakra.span>
                    </Text>
                    <Tooltip label={onCheck(`Component Version`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  size='md'
                  fontSize={'sm'}
                  placeholder='Enter version'
                  value={compVersion}
                  onChange={(e) => setCompVersion(e.target.value)}
                />
                <FormErrorMessage>
                  This version of the product already exists. Continuing will
                  override one of these versions.
                </FormErrorMessage>
              </FormControl>
              {/* GROUP */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='groupInfo' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Group</Text>
                    <Tooltip label={onCheck(`Component Group`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  size='md'
                  fontSize={'sm'}
                  placeholder='Add group'
                  value={groupInfo}
                  onChange={(e) => setGroupInfo(e.target.value)}
                />
              </FormControl>
              {/* KIND */}
              <FormControl>
                <FormLabel htmlFor='componentType' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>
                      Type{' '}
                      <chakra.span color={'red.500'} ml={1}>
                        *
                      </chakra.span>
                    </Text>
                    <Tooltip label={onCheck(`Component Type`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  fontSize={'sm'}
                  value={compKind}
                  id='componentType'
                  name='componentType'
                  isDisabled={customerView}
                  onChange={(e) => setCompKind(e.target.value)}
                  textTransform={'capitalize'}
                >
                  <option value=''>-- Select --</option>
                  {componentTypes?.map((item, index) => (
                    <option
                      key={index}
                      value={item}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {item}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {/* LICENSES */}
              <LicenseField
                sbomView={false}
                isDisabled={customerView}
                license={data?.licensesExp}
              />
              {/* SCOPE */}
              <FormControl>
                <FormLabel htmlFor='compScope'>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Scope</Text>
                    <Tooltip label={onCheck(`Component Scope`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  id='compScope'
                  name='compScope'
                  size='md'
                  fontSize={'sm'}
                  value={compScope}
                  isDisabled={customerView}
                  onChange={(e) => setCompScope(e.target.value)}
                >
                  <option value='' style={{ background: 'lightgray' }}>
                    -- Select --
                  </option>
                  <option value='excluded'>Excluded</option>
                  <option value='optional'>Optional</option>
                  <option value='required'>Required</option>
                </Select>
              </FormControl>
              {/* PRIMARY COMPONENT */}
              <FormControl isReadOnly={customerView} isDisabled>
                <Flex alignItems={'center'} gap={2}>
                  <Checkbox size='sm' colorScheme='blue' defaultChecked={true}>
                    Primary component
                  </Checkbox>
                  <Tooltip label={onCheck(`Primary Component`)}>
                    <InfoIcon fontSize={14} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </FormControl>
              {/* INTERNAL COMPONENT */}
              <FormControl isReadOnly={customerView}>
                <Flex alignItems={'center'} gap={2}>
                  <Checkbox
                    size='sm'
                    colorScheme='blue'
                    isChecked={isInternal}
                    onChange={() => setIsInternal(!isInternal)}
                  >
                    Internal component
                  </Checkbox>
                  <Tooltip label={onCheck(`Internal Component`)}>
                    <InfoIcon fontSize={14} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </FormControl>
              <Button
                colorScheme='blue'
                variant={'outline'}
                width={'fit-content'}
                isDisabled={isInvalid}
                onClick={onCreateSBOM}
                isLoading={sbomLoading || compLoading}
              >
                Save
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ProductSbomDrawer
