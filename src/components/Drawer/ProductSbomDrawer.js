// Chakra imports
import React, { useState, useContext } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Checkbox,
  useDisclosure,
  Text
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { sbomCreate, CreateComponent } from 'graphQL/Mutation'
import GlobalContext from 'context/GlobalContext'
import LicenseField from 'components/LicenseField'

function ProductSbomDrawer({ isOpen, onClose, refetch, data }) {
  const toast = useToast()
  const [expLicense, setExpLicense] = useState('')

  const {
    prodField,
    prodDirection,
    licenseType,
    spdxLicense,
    totalRows,
    customLicense
  } = useContext(GlobalContext)

  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const handleRefetch = () => {
    refetch({
      first: totalRows,
      field: prodField,
      direction: prodDirection
    })
  }

  const [createSbom] = useMutation(sbomCreate, {
    onCompleted: () => handleRefetch()
  })

  const [createComponent] = useMutation(CreateComponent)

  const [sbomName, setSbomName] = useState('')
  const [version, setVersion] = useState('')
  const [compType, setCompType] = useState('')

  const existingVersions = data?.sboms.map(
    (item) => item?.primaryComponent?.version
  )

  const handleCreateComp = async (id) => {
    await createComponent({
      variables: {
        sbomId: id,
        kind: compType,
        name: sbomName,
        version: version,
        licenses: {
          licenses: licenseType === 'license_spdx' ? spdxLicense : undefined,
          licensesExp: licenseType === 'license_exp' ? expLicense : undefined,
          licensesCustom:
            licenseType === 'license_custom' ? customLicense : undefined
        },
        primary: true
      }
    }).then(
      (res) =>
        res.data &&
        toast({
          description: 'SBOM added successfully',
          status: 'success',
          position: 'top',
          duration: 3000
        })
    )
  }

  const onCreateSBOM = async () => {
    await createSbom({
      variables: {
        projectId: data.id,
        spec: 'cyclonedx',
        specVersion: '1.4',
        format: 'json'
      }
    })
      .then((res) => {
        if (res.data.sbomCreate.errors.length === 0) {
          handleCreateComp(res.data.sbomCreate.sbom.id)
        } else {
          toast({
            description: res.data.sbomCreate.errors,
            status: 'error',
            position: 'top',
            duration: 4000
          })
        }
      })
      .finally(() => onClose())
  }

  const handleCreateSBOM = async () => {
    if (existingVersions?.includes(version)) {
      onWarningOpen()
    } else {
      onCreateSBOM()
    }
  }

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='sm'>
        <DrawerOverlay />

        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px' color='gray.600'>
            Create SBOM
          </DrawerHeader>
          <DrawerBody>
            <Stack direction={'column'} spacing={4}>
              {/* NAME */}
              <FormControl>
                <FormLabel htmlFor='sbomName' fontSize={'sm'}>
                  Name
                </FormLabel>
                <Input
                  fontSize={'sm'}
                  type='text'
                  id='sbomName'
                  name='sbomName'
                  value={sbomName}
                  onChange={(e) => setSbomName(e.target.value)}
                  placeholder='Enter name'
                />
              </FormControl>
              {/* VERSION */}
              <FormControl>
                <FormLabel htmlFor='sbomVersion' fontSize={'sm'}>
                  Version
                </FormLabel>
                <Input
                  fontSize={'sm'}
                  type='text'
                  id='sbomVersion'
                  name='sbomVersion'
                  vaue={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder='Enter version'
                />
              </FormControl>
              {/* Format */}
              <FormControl>
                <FormLabel htmlFor='compType' fontSize={'sm'}>
                  Type
                </FormLabel>
                <Select
                  id='compType'
                  name='compType'
                  fontSize={'sm'}
                  value={compType}
                  onChange={(e) => setCompType(e.target.value)}
                >
                  <option value=''>-- Select --</option>
                  <option value='application'>Application</option>
                  <option value='library'>Library</option>
                  <option value='operating-system'>Operating System</option>
                  <option value='firmware'>Firmware</option>
                  <option value='file'>File</option>
                  <option value='device'>Device</option>
                  <option value='container'>Container</option>
                  <option value='framework'>Framework</option>
                  <option value='source'>Source</option>
                  <option value='archive'>Archive</option>
                  <option value='install'>Install</option>
                  <option value='other'>Other</option>
                  <option value='unspecified'>Unspecified</option>
                </Select>
              </FormControl>
              {/* Licenses */}
              <LicenseField data={data} />
              {/* PRIMARY COMPONENT */}
              <FormControl htmlFor={'isPrimary'} isReadOnly={true}>
                <Checkbox
                  size='sm'
                  id='isPrimary'
                  name='isPrimary'
                  colorScheme='blue'
                  defaultChecked={true}
                >
                  Primary component
                </Checkbox>
              </FormControl>
            </Stack>
          </DrawerBody>
          <DrawerFooter borderTopWidth='1px'>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleCreateSBOM}
              disabled={sbomName === '' || compType === ''}
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* WARNING */}
      {isWarningOpen && (
        <Modal isOpen={isWarningOpen} onClose={onWarningClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{version}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                An SBOM with the same version already exists. Continuing with
                building this SBOM will delete existing version data and replace
                it with the SBOM being built.{' '}
              </Text>
              <Text mt={10}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onWarningClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={onCreateSBOM}>
                Ok
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default ProductSbomDrawer
