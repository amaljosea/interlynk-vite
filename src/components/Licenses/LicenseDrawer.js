import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable'

import {
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  Link,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea
} from '@chakra-ui/react'

import { CreateLicense, UpdateLicense } from '../../graphQL/Mutation'

const LicenseDrawer = ({ isOpen, onClose, data, refetch }) => {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [comment, setComment] = useState('')
  const [attributionKeys, setAttributionKeys] = useState([])
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

  const [drawerSize, setDrawerSize] = useState('md')

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

  const handleExpand = () => {
    if (drawerSize === 'md') {
      setDrawerSize('full')
    } else {
      setDrawerSize('md')
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      size={drawerSize}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        {drawerSize === 'md' ? (
          <DrawerHeader>{data ? 'Edit' : 'Add'} License</DrawerHeader>
        ) : (
          <DrawerHeader>License</DrawerHeader>
        )}
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
              <FormLabel htmlFor='text'>
                License Text
                <Link
                  color={'blue.500'}
                  mx={2}
                  _hover={{ textDecoration: 'underline' }}
                  fontWeight={'medium'}
                  fontSize={'11px'}
                  onClick={handleExpand}
                >
                  {drawerSize === 'md' && '(Expand)'}
                </Link>
              </FormLabel>
              <Textarea
                height={drawerSize === 'md' ? '200px' : '800px'}
                name='text'
                id='text'
                fontSize={'sm'}
                value={text}
                placeholder='Add text'
                onChange={(e) => setText(e.target.value)}
                disabled={data}
                resize={'none'}
              />
            </FormControl>
            {drawerSize === 'md' && (
              <>
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
                  <CreatableSelect
                    isMulti
                    name='attributionKeys'
                    id='attributionKeys'
                    placeholder='Add attribution keys'
                    size={'sm'}
                    value={attributionKeys?.map((value) => ({
                      label: value,
                      value: value
                    }))}
                    onChange={(values) =>
                      setAttributionKeys(values?.map((v) => v.value))
                    }
                    styles={{
                      placeholder: (defaultStyles) => {
                        return {
                          ...defaultStyles,
                          fontSize: 'small'
                        }
                      }
                    }}
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
                  <Select
                    onChange={(e) => setAttribution(e.target.value)}
                    value={attribution}
                    fontSize={'sm'}
                  >
                    <option value='UNKNOWN'>Unknown</option>
                    <option value='YES'>Yes</option>
                    <option value='NO'>No</option>
                  </Select>
                </FormControl>

                {/* CopyLeft */}
                <FormControl>
                  <FormLabel htmlFor='CopyLeft'>CopyLeft</FormLabel>
                  <Select
                    onChange={(e) => setCopyLeft(e.target.value)}
                    value={copyLeft}
                    fontSize={'sm'}
                  >
                    <option value='UNKNOWN'>Unknown</option>
                    <option value='PERMISSIVE'>Permissive</option>
                    <option value='COPYLEFT'>Copyleft</option>
                    <option value='WEAK'>Weak</option>
                  </Select>
                </FormControl>

                {/* Radios */}
                <FormControl>
                  <FormLabel htmlFor='requiresSourceCode'>
                    Requires Source Code
                  </FormLabel>
                  <RadioGroup
                    onChange={setRequiresSourceCode}
                    value={requiresSourceCode}
                  >
                    <Radio mx={5} size='md' colorScheme='blue' value='YES'>
                      <Text fontSize='sm'>Yes</Text>
                    </Radio>
                    <Radio mx={5} size='md' colorScheme='blue' value='NO'>
                      <Text fontSize='sm'>No</Text>
                    </Radio>
                    <Radio mx={5} size='md' colorScheme='blue' value='UNKNOWN'>
                      <Text fontSize='sm'>Unknown</Text>
                    </Radio>
                  </RadioGroup>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='permitsModifications'>
                    Permits Modifications
                  </FormLabel>
                  <RadioGroup
                    onChange={setPermitsModifications}
                    value={permitsModifications}
                  >
                    <Radio mx={5} size='md' colorScheme='blue' value='YES'>
                      <Text fontSize='sm'>Yes</Text>
                    </Radio>
                    <Radio mx={5} size='md' colorScheme='blue' value='NO'>
                      <Text fontSize='sm'>No</Text>
                    </Radio>
                    <Radio mx={5} size='md' colorScheme='blue' value='UNKNOWN'>
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
              </>
            )}
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          {drawerSize === 'md' ? (
            !data ? (
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
            )
          ) : (
            <Button colorScheme='blue' onClick={handleExpand}>
              Back
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default LicenseDrawer
