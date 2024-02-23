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
  Text, RadioGroup, Radio, Checkbox, Textarea
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import {CreateLicense, UpdateLicense} from "../../graphQL/Mutation";
import {useMutation} from "@apollo/client";

const LicenseDrawer = ({ isOpen, onClose, data, refetch }) => {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [comment, setComment] = useState('')
  const [attributionKeys, setAttributionKeys] = useState('')
  const [warranty, setWarranty] = useState('')
  const [governingLaws, setGoverningLaws] = useState('')

  const [deprecated, setDeprecated] = useState(false)
  const [restrictive, setRestrictive] = useState(false)
  const [fsfLibre, setFsfLibre] = useState(false)
  const [osiApproved, setOsiApproved] = useState(false)

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
        permitsModifications,
        text,
        url,
        comment,
        attributionKeys,
        warranty,
        governingLaws,
        deprecated,
        restrictive,
        fsfLibre,
        osiApproved
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
        attributionKeys,
        copyLeft,
        requiresSourceCode,
        permitsModifications,
        warranty,
        governingLaws,
        deprecated,
        restrictive,
        fsfLibre,
        osiApproved
      }
    })
    await refetch()
    onClose()
  }

  useEffect(() => {
    if (data) {
      setName(data.content.name)
      setText(data.content.text)
      setUrl(data.content.url)
      setComment(data.content.comment)
      setAttributionKeys(data.attributionKeys)
      setWarranty(data.warranty)
      setGoverningLaws(data.governingLaws)

      setDeprecated(data.deprecated)
      setRestrictive(data.restrictive)
      setFsfLibre(data.fsfLibre)
      setOsiApproved(data.osiApproved)

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

            <FormControl isRequired>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                name='name'
                id='name'
                fontSize={'sm'}
                value={name}
                placeholder='Add name'
                onChange={(e) => setName(e.target.value)}
                disabled={data}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor='text'>Text</FormLabel>
              <Textarea
                height={'200px'}
                name='text'
                id='text'
                fontSize={'sm'}
                value={text}
                placeholder='Add text'
                onChange={(e) => setText(e.target.value)}
                disabled={data}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor='url'>URL</FormLabel>
              <Input
                name='url'
                id='url'
                fontSize={'sm'}
                value={url}
                placeholder='Add url'
                onChange={(e) => setUrl(e.target.value)}
                disabled={data}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor='comment'>Comment</FormLabel>
              <Input
                name='comment'
                id='name'
                fontSize={'sm'}
                value={comment}
                placeholder='Add name'
                onChange={(e) => setComment(e.target.value)}
                disabled={data}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor='url'>Attribution Keys</FormLabel>
              <Input
                name='attributionKeys'
                id='attributionKeys'
                fontSize={'sm'}
                value={attributionKeys}
                placeholder='Add attribution keys'
                onChange={(e) => setAttributionKeys(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor='url'>Warranty</FormLabel>
              <Input
                name='warranty'
                id='warranty'
                fontSize={'sm'}
                value={warranty}
                placeholder='Add warranty'
                onChange={(e) => setWarranty(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor='url'>Governing Laws</FormLabel>
              <Input
                name='governingLaws'
                id='governingLaws'
                fontSize={'sm'}
                value={governingLaws}
                placeholder='Add governing laws'
                onChange={(e) => setGoverningLaws(e.target.value)}
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

            <Checkbox
              isChecked={deprecated}
              size='sm'
              colorScheme='blue'
              onChange={(e) => setDeprecated(e.target.checked)}
            >
              Is deprecated?
            </Checkbox>

            <Checkbox
              isChecked={restrictive}
              size='sm'
              colorScheme='blue'
              onChange={(e) => setRestrictive(e.target.checked)}
            >
              Is restrictive?
            </Checkbox>

            <Checkbox
              isChecked={fsfLibre}
              size='sm'
              colorScheme='blue'
              onChange={(e) => setFsfLibre(e.target.checked)}
            >
              Is FSF Libre?
            </Checkbox>

            <Checkbox
            isChecked={osiApproved}
            size='sm'
            colorScheme='blue'
            onChange={(e) => setOsiApproved(e.target.checked)}
          >
            OSI Approved?
          </Checkbox>

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
