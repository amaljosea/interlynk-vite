import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text, RadioGroup, Radio
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import {CreateLicense, UpdateLicense} from "../../graphQL/Mutation";
import {useMutation} from "@apollo/client";

const LicenseDrawer = ({ isOpen, onClose, data, refetch }) => {
  const [name, setName] = useState('')
  const [spdxId, setSpdxId] = useState('')
  const [attribution, setAttribution] = useState('UNKNOWN')
  const [copyLeft, setCopyLeft] = useState(data?.copyLeft || 'UNKNOWN')
  const [requiresSourceCode, setRequiresSourceCode] = useState('UNKNOWN')
  const [permitsModifications, setPermitsModifications] = useState('UNKNOWN')
  const [state, setState] = useState('UNSPECIFIED')

  const [createLicense] = useMutation(CreateLicense)
  const [updateLicense] = useMutation(UpdateLicense)


  const handleCreateLicense = async () => {
    await createLicense({
      variables: {
        name,
        state,
        attribution,
        copyLeft,
        requiresSourceCode,
        permitsModifications
      }
    })
    await refetch()
    onClose()
  }

  const handleUpdateLicense = async () => {
    await updateLicense({
      variables: {
        id: data.id,
        state,
        attribution,
        copyLeft,
        requiresSourceCode,
        permitsModifications
      }
    })
    await refetch()
    onClose()
  }

  useEffect(() => {
    if (data) {
      setName(data.content.name)
      setSpdxId(data.content.shortId)
      setState(data.state)
      setAttribution(data.attribution)
      setCopyLeft(data.copyLeft)
      setRequiresSourceCode(data.sourceDistribution)
      setPermitsModifications(data.modifications)
    }
  }, [data])

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{data ? 'Edit' : 'Add'} License</DrawerHeader>
        <DrawerBody>
          <Stack direction={'column'} spacing={4} alignItems={'flex-start'}>
            {/* NAME */}
            <FormControl isRequired>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                name='name'
                id='name'
                fontSize={'sm'}
                value={name}
                placeholder='Add name'
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            {/* SPDX ID */}
            <FormControl>
              <FormLabel htmlFor='spdxId'>SPDX ID</FormLabel>
              <Input
                name='spdxId'
                id='spdxId'
                value={spdxId}
                fontSize={'sm'}
                placeholder='Add SPDX ID'
                disabled
                onChange={(e) => setSpdxId(e.target.value)}
              />
            </FormControl>
            {/* Attribution */}
            <FormControl>
              <FormLabel htmlFor='attribution'>Attribution</FormLabel>
              <Select onChange={(e) => setAttribution(e.target.value)}
                      value={attribution} fontSize={'sm'}
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </Select>
            </FormControl>
            {/* CopyLeft */}
            <FormControl>
              <FormLabel htmlFor='CopyLeft'>CopyLeft</FormLabel>
              <Select onChange={(e) => setCopyLeft(e.target.value)}
                      value={copyLeft} fontSize={'sm'}
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="PERMISSIVE">Permissive</option>
                <option value="COPYLEFT">Copyleft</option>
                <option value="WEAK">Weak</option>
              </Select>
            </FormControl>

            {/* Radios */}
            <FormControl>
              <FormLabel htmlFor='requiresSourceCode'>Requires Source Code</FormLabel>
                <RadioGroup onChange={setRequiresSourceCode} value={requiresSourceCode}>
                  <Radio mx={5} size='md' colorScheme='blue' value="YES">
                    <Text fontSize='sm'>Yes</Text>
                  </Radio>
                  <Radio mx={5} size='md' colorScheme='blue' value="NO">
                    <Text fontSize='sm'>No</Text>
                  </Radio>
                  <Radio mx={5} size='md' colorScheme='blue' value="UNKNOWN">
                    <Text fontSize='sm'>Unknown</Text>
                  </Radio>
                </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='permitsModifications'>Permits Modifications</FormLabel>
              <RadioGroup onChange={setPermitsModifications} value={permitsModifications}>
                <Radio mx={5} size='md' colorScheme='blue' value="YES">
                  <Text fontSize='sm'>Yes</Text>
                </Radio>
                <Radio mx={5} size='md' colorScheme='blue' value="NO">
                  <Text fontSize='sm'>No</Text>
                </Radio>
                <Radio mx={5} size='md' colorScheme='blue' value="UNKNOWN">
                  <Text fontSize='sm'>Unknown</Text>
                </Radio>
              </RadioGroup>
            </FormControl>
            {/* STATUS */}
            <FormControl>
              <FormLabel htmlFor='state'>Status</FormLabel>
              <Select
                fontSize={'sm'}
                name='state'
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value='APPROVED'>Approved</option>
                <option value='REJECTED'>Rejected</option>
                <option value='UNSPECIFIED'>Unspecified</option>
              </Select>
            </FormControl>
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          {!data ? (
            <Button
              colorScheme='blue'
              onClick={handleCreateLicense}
              disabled={name === ''}
            >
              Save
            </Button>
          ) : (
            <Button
              colorScheme='blue'
              onClick={handleUpdateLicense}
              disabled={name === ''}
            >
              Update
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default LicenseDrawer
