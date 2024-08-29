import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { useLocation } from 'react-router-dom'
import { infoData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Button,
  Checkbox,
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
  chakra,
  useColorMode,
  useDisclosure
} from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import PrimaryWarning from 'components/Modal/PrimaryWarning'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { UpdateComponent } from 'graphQL/Mutation'
import { GetAllSboms } from 'graphQL/Queries'

const CompDetails = ({ data, primaryComp }) => {
  const location = useLocation()
  const { showToast } = useCustomToast()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const customerView = location.pathname.startsWith('/customer')

  const { sbomId, sbom } = data || ''
  const { id: productId } = sbom?.project || ''

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { prodCompState, dispatch } = useGlobalState()
  const { expLicense } = prodCompState
  const { prodCompDispatch } = dispatch

  const [updateComponent, { loading }] = useMutation(UpdateComponent)

  const [groupInfo, setGroupInfo] = useState('')
  const [compName, setCompName] = useState('')
  const [compDesc, setCompDesc] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compKind, setCompKind] = useState('')
  const [compScope, setCompScope] = useState('')
  const [compSupport, setCompSupport] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [isInternal, setIsInternal] = useState(false)

  const [selectedDate, setSelectedDate] = useState('')
  const [isValidDate, setIsValidDate] = useState(true)

  const { colorMode } = useColorMode()
  const react_datatime = colorMode === 'light' ? 'light_picker' : 'dark_picker'

  const handleDateChange = (newDate) => {
    console.log('newDate', newDate)
    const isValidDate = newDate && !isNaN(newDate)
    setSelectedDate(newDate._d)
    if (isValidDate) {
      setIsValidDate(true)
    } else {
      setIsValidDate(false)
    }
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
    const result = data?.project?.sboms?.map((item) => item?.projectVersion)
    SBOMs = result
  }

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  const handleUpdateCom = () => {
    updateComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        kind: compKind,
        name: compName,
        description: compDesc,
        version: compVersion,
        group: groupInfo,
        scope: compScope,
        licenses: { licensesExp: expLicense || '' },
        primary: isPrimary,
        internal: isInternal
      }
    }).then((res) => {
      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        showToast({
          description: 'Details updated successfully',
          status: 'success'
        })
        prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  const invalidVersion = compVersion !== '' && SBOMs?.includes(compVersion)

  const isInvalid =
    compKind === '' || compName === '' || compVersion === '' || loading

  useEffect(() => {
    if (data) {
      setGroupInfo(data?.group)``
      setCompName(data?.name)
      setCompDesc(data?.description)
      setCompVersion(data?.version)
      setCompKind(data?.kind)
      setCompScope(data?.scope)
      setIsPrimary(data?.primary)
      setIsInternal(data?.internal)
    }
  }, [data])

  return (
    <>
      <Stack direction={'column'} spacing={4} px={6}>
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
            This version of the product already exists. Continuing will override
            one of these versions.
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
            id='componentType'
            name='componentType'
            size='md'
            fontSize={'sm'}
            value={compKind}
            isDisabled={customerView}
            onChange={(e) => setCompKind(e.target.value)}
            textTransform={'capitalize'}
          >
            <option value='' style={{ background: 'lightgray' }}>
              -- Select --
            </option>
            {[
              'application',
              'framework',
              'library',
              'container',
              'platform',
              'operating-system',
              'device',
              'device-driver',
              'firmware',
              'file',
              'machine-learning-model',
              'data'
            ].map((item, index) => (
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
        {/* SUPPRT LEVEL */}
        <FormControl hidden={!shouldShowDemoFeatures}>
          <FormLabel htmlFor='compScope'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
              <Text>Support Level</Text>
              <Tooltip label={onCheck(`Component Support`)}>
                <InfoIcon color={'blue.500'} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Select
            id='compSupport'
            name='compSupport'
            size='md'
            fontSize={'sm'}
            value={compSupport}
            isDisabled={customerView}
            onChange={(e) => setCompSupport(e.target.value)}
          >
            <option value='' style={{ background: 'lightgray' }}>
              -- Select --
            </option>
            <option value='unspecified'>Unspecified</option>
            <option value='actively_maintained'>Actively Maintained</option>
            <option value='no_longer_maintained'>No Longer Maintained</option>
            <option value='abandoned'>Abandoned</option>
          </Select>
        </FormControl>
        {/* END-OF-SUPPORT DATE */}
        <FormControl
          mb={5}
          isInvalid={!isValidDate}
          isDisabled={compSupport === ''}
          hidden={!shouldShowDemoFeatures}
        >
          <FormLabel mb={1} htmlFor='endOfSupport'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
              <Text>End-Of-Support Date</Text>
              <Tooltip label={onCheck(`Component Support Date`)}>
                <InfoIcon color={'blue.500'} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Datetime
            value={selectedDate}
            closeOnSelect={true}
            className={`${react_datatime} endOfSupport`}
            onChange={handleDateChange}
            inputProps={{
              disabled: compSupport === '',
              onCopy: (e) => e.preventDefault(),
              onPaste: (e) => e.preventDefault(),
              style: {
                background: 'none'
              }
            }}
          />
          {!isValidDate && (
            <FormErrorMessage>Please enter a valid datetime</FormErrorMessage>
          )}
        </FormControl>
        {/* PRIMARY COMPONENT */}
        <FormControl isReadOnly={customerView}>
          <Flex alignItems={'center'} gap={2}>
            <Checkbox
              size='sm'
              onChange={onOpen}
              colorScheme='blue'
              isChecked={isPrimary}
            >
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
          onClick={handleUpdateCom}
        >
          Save
        </Button>
      </Stack>

      {isOpen && (
        <PrimaryWarning
          isOpen={isOpen}
          name={compName}
          onClose={onClose}
          version={compVersion}
          setData={setIsPrimary}
          primaryComp={primaryComp}
        />
      )}
    </>
  )
}

export default CompDetails
