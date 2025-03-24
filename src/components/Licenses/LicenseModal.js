import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'

import {
  Checkbox,
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

import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaScaleBalanced } from 'react-icons/fa6'

import { CreateLicense, UpdateLicense } from '../../graphQL/Mutation'

const LicenseDrawer = ({ isOpen, onClose, data, updateLic }) => {
  const { showToast } = useCustomToast()

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

  const [createLicense,{loading: createLoading}] = useMutation(CreateLicense)
  const [updateLicense,{loading: updateLoading}] = useMutation(UpdateLicense)

  const [drawerSize, setDrawerSize] = useState('md')
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

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
    onClose()
  }

  const handleUpdateLicense = () => {
    updateLicense({
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
    }).then(() => {
      showToast({
        description:
          'License properties and all product versions, including this license, are being updated. This could take some time.',
        status: 'success'
      })
      onClose()
    })
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

  const handleSubmit = () =>
    data ? handleUpdateLicense() : handleCreateLicense()

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      hidden={!updateLic}
      Icon={FaScaleBalanced}
      isLoading={createLoading || updateLoading}
      disabled={drawerSize === 'md' ? name === '' : false}
      onSubmit={drawerSize === 'md' ? handleSubmit : handleExpand}
      title={`${!updateLic ? 'View' : data ? 'Edit' : 'Add'} License`}
      buttonText={drawerSize === 'md' ? (data ? 'Update' : 'Save') : 'Back'}
    >
      <Stack direction={'column'} spacing={4} alignItems={'flex-start'}>
        <FormControl isRequired isDisabled={!updateLic}>
          <FormLabel htmlFor='name'>Name</FormLabel>
          <Input
            name='name'
            id='name'
            fontSize={'sm'}
            value={name}
            aria-label='license_name'
            placeholder='Add name'
            onChange={(e) => setName(e.target.value)}
            disabled={data}
          />
        </FormControl>

        <FormControl isDisabled={!updateLic}>
          <FormLabel htmlFor='text'>
            License Text
            <Link
              color={primaryBlueText}
              mx={2}
              _hover={{ textDecoration: 'underline' }}
              fontWeight={'medium'}
              fontSize={'11px'}
              onClick={handleExpand}
            >
              {drawerSize === 'md' ? '(Expand)' : '(Collapse)'}
            </Link>
          </FormLabel>
          <Textarea
            height={drawerSize === 'md' ? '80px' : '600px'}
            name='text'
            id='text'
            value={text}
            placeholder='Add text'
            onChange={(e) => setText(e.target.value)}
            disabled={
              (data && data?.content?.__typename !== 'LicenseCustom') ||
              !updateLic
            }
            resize={'none'}
          />
        </FormControl>
        {drawerSize === 'md' && (
          <>
            <FormControl isDisabled={!updateLic}>
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

            <FormControl isDisabled={!updateLic}>
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
              <FormLabel htmlFor='attributionKeys'>Attribution Keys</FormLabel>
              <LynkSelect
                isCreatable
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
                isDisabled={!updateLic}
              />
            </FormControl>

            <FormControl isDisabled={!updateLic}>
              <FormLabel htmlFor='warranty'>Warranty</FormLabel>
              <Input
                name='warranty'
                id='warranty'
                fontSize={'sm'}
                value={warranty}
                placeholder='Add warranty'
                onChange={(e) => setWarranty(e.target.value)}
              />
            </FormControl>

            <FormControl isDisabled={!updateLic}>
              <FormLabel htmlFor='governingLaws'>Governing Laws</FormLabel>
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
            <FormControl isDisabled={!updateLic}>
              <FormLabel htmlFor='attribution'>Attribution</FormLabel>
              <Select
                value={attribution}
                aria-label='license_attr'
                onChange={(e) => setAttribution(e.target.value)}
              >
                <option value='UNKNOWN'>Unknown</option>
                <option value='YES'>Yes</option>
                <option value='NO'>No</option>
              </Select>
            </FormControl>

            {/* CopyLeft */}
            <FormControl isDisabled={!updateLic}>
              <FormLabel htmlFor='CopyLeft'>CopyLeft</FormLabel>
              <Select
                value={copyLeft}
                onChange={(e) => setCopyLeft(e.target.value)}
              >
                <option value='UNKNOWN'>Unknown</option>
                <option value='PERMISSIVE'>Permissive</option>
                <option value='COPYLEFT'>Copyleft</option>
                <option value='WEAK'>Weak</option>
              </Select>
            </FormControl>

            {/* Radios */}
            <FormControl isDisabled={!updateLic}>
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
            <FormControl isDisabled={!updateLic}>
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
              isDisabled={!updateLic}
              isChecked={deprecated}
              size='sm'
              colorScheme='blue'
              onChange={(e) => setDeprecated(e.target.checked)}
            >
              Is deprecated?
            </Checkbox>

            <Checkbox
              isDisabled={!updateLic}
              isChecked={restrictive}
              size='sm'
              colorScheme='blue'
              onChange={(e) => setRestrictive(e.target.checked)}
            >
              Is restrictive?
            </Checkbox>

            <Checkbox
              isDisabled={!updateLic}
              isChecked={fsfLibre}
              size='sm'
              colorScheme='blue'
              onChange={(e) => setFsfLibre(e.target.checked)}
            >
              Is FSF Libre?
            </Checkbox>

            <Checkbox
              isDisabled={!updateLic}
              isChecked={osiApproved}
              size='sm'
              colorScheme='blue'
              onChange={(e) => setOsiApproved(e.target.checked)}
            >
              OSI Approved?
            </Checkbox>

            <FormControl isDisabled={!updateLic}>
              <FormLabel htmlFor='state'>Status</FormLabel>
              <Select
                name='state'
                value={state}
                aria-label='license_status'
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
    </LynkModal>
  )
}

export default LicenseDrawer
