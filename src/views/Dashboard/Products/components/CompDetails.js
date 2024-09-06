import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import React, { useContext, useEffect, useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { useLocation } from 'react-router-dom'
import { infoData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Button,
  Checkbox,
  Divider,
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

import { UpdateComponent } from 'graphQL/Mutation'
import { GetAllSboms } from 'graphQL/Queries'

const CompDetails = ({ data, primaryComp }) => {
  const location = useLocation()
  const { showToast } = useCustomToast()
  const customerView = location.pathname.startsWith('/customer')

  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch

  const { tabData, setTabData, handleChange, saveChanges } =
    useContext(TabContext)
  const { details } = tabData

  const inputStyle = { size: 'md', fontSize: 'sm' }

  const { sbomId, sbom } = data || ''
  const { id: productId } = sbom?.project || ''

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [updateComponent, { loading }] = useMutation(UpdateComponent)

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)
  const [isValidDate, setIsValidDate] = useState(true)

  const { colorMode } = useColorMode()
  const react_datatime = colorMode === 'light' ? 'light_picker' : 'dark_picker'

  const handleDateChange = (newDate) => {
    const isValidDate = newDate && !isNaN(newDate)
    setTabData((prev) => ({
      ...prev,
      details: { ...prev?.details, endOfSupport: newDate._d }
    }))
    if (newDate) {
      if (isValidDate) {
        setIsValidDate(true)
      } else {
        setIsValidDate(false)
      }
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

  const license = details?.licenses?.length > 0 ? details.licenses[0].value : ''

  const handleUpdateCom = () => {
    updateComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        kind: details?.kind,
        name: details?.name,
        scope: details?.scope,
        group: details?.group,
        primary: details?.primary,
        internal: details?.internal,
        version: details?.version,
        description: details?.description,
        copyright: details?.copyright,
        supportLevel: details?.supportLevel,
        endOfSupport: details?.endOfSupport,
        licenses: { licensesExp: license }
      }
    }).then((res) => {
      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        saveChanges()
        showToast({
          description: 'Details updated successfully',
          status: 'success'
        })
        prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  const invalidVersion =
    details?.version !== '' && SBOMs?.includes(details?.version)

  const isInvalid =
    details?.kind === '' ||
    details?.name === '' ||
    details?.version === '' ||
    loading

  useEffect(() => {
    if (data) {
      setTabData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          name: data?.name,
          kind: data?.kind,
          scope: data?.scope,
          group: data?.group,
          primary: data?.primary,
          version: data?.version,
          internal: data?.internal,
          description: data?.description,
          copyright: data?.copyright,
          supportLevel: data?.supportLevel,
          endOfSupport: data?.endOfSupport
        }
      }))
    }
  }, [data, setTabData])

  return (
    <>
      <Stack direction={'column'} spacing={4} px={6}>
        {/* Name */}
        <FormControl isReadOnly={customerView}>
          <FormLabel htmlFor='name' fontSize={'sm'}>
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
            name='name'
            sx={inputStyle}
            value={details?.name}
            placeholder='Enter name'
            onChange={(e) => handleChange('details', 'name', e.target.value)}
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
            sx={inputStyle}
            name='description'
            value={details?.description}
            placeholder='Add description'
            onChange={(e) =>
              handleChange('details', 'description', e.target.value)
            }
          />
        </FormControl>
        {/* Copyright */}
        <FormControl isReadOnly={customerView}>
          <FormLabel htmlFor='copyright' fontSize={'sm'}>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
              <Text>Copyright</Text>
              <Tooltip label={onCheck(`Component Copyright`)}>
                <InfoIcon color={'blue.500'} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Textarea
            sx={inputStyle}
            name='copyright'
            value={details?.copyright}
            placeholder='Add copyright'
            onChange={(e) =>
              handleChange('details', 'copyright', e.target.value)
            }
          />
        </FormControl>
        {/* Version */}
        <FormControl isReadOnly={customerView} isInvalid={invalidVersion}>
          <FormLabel htmlFor='version' fontSize={'sm'}>
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
            name='version'
            sx={inputStyle}
            value={details?.version}
            placeholder='Enter version'
            onChange={(e) => handleChange('details', 'version', e.target.value)}
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
            name='group'
            value={details?.group}
            sx={inputStyle}
            placeholder='Add group'
            onChange={(e) => handleChange('details', 'group', e.target.value)}
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
            name='kind'
            value={details?.kind}
            sx={inputStyle}
            isDisabled={customerView}
            textTransform={'capitalize'}
            onChange={(e) => handleChange('details', 'kind', e.target.value)}
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
            name='scope'
            value={details?.scope}
            sx={inputStyle}
            isDisabled={customerView}
            onChange={(e) => handleChange('details', 'scope', e.target.value)}
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
        <FormControl>
          <FormLabel htmlFor='compScope'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
              <Text>Support Level</Text>
              <Tooltip label={onCheck(`Support Level`)}>
                <InfoIcon color={'blue.500'} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Select
            sx={inputStyle}
            name='supportLevel'
            value={details?.supportLevel}
            isDisabled={customerView}
            onChange={(e) =>
              handleChange('details', 'supportLevel', e.target.value)
            }
          >
            <option value='' style={{ background: 'lightgray' }}>
              -- Select --
            </option>
            <option value='UNSPECIFIED'>Unspecified</option>
            <option value='ACTIVELY_MAINTAINED'>Actively Maintained</option>
            <option value='NO_LONGER_MAINTAINED'>No Longer Maintained</option>
            <option value='ABANDONED'>Abandoned</option>
          </Select>
        </FormControl>
        {/* END-OF-SUPPORT DATE */}
        <FormControl mb={5} isInvalid={!isValidDate}>
          <FormLabel mb={1} htmlFor='endOfSupport'>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
              <Text>End-Of-Support Date</Text>
              <Tooltip label={onCheck(`End-of-Support Date`)}>
                <InfoIcon color={'blue.500'} />
              </Tooltip>
            </Flex>
          </FormLabel>
          <Datetime
            timeFormat={false}
            closeOnSelect={true}
            value={details?.endOfSupport}
            className={`${react_datatime} endOfSupport`}
            onChange={handleDateChange}
            inputProps={{
              name: 'endOfSupport',
              placeholder: 'Add support date',
              disabled: details?.supportLevel === '',
              onCopy: (e) => e.preventDefault(),
              onPaste: (e) => e.preventDefault(),
              style: {
                background: 'none',
                fontSize: '14px'
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
              name='primary'
              onChange={onOpen}
              colorScheme='blue'
              isChecked={details?.primary}
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
              name='internal'
              colorScheme='blue'
              isChecked={details?.internal}
              onChange={(e) =>
                handleChange('details', 'internal', e.target.checked)
              }
            >
              Internal component
            </Checkbox>
            <Tooltip label={onCheck(`Internal Component`)}>
              <InfoIcon fontSize={14} color={'blue.500'} />
            </Tooltip>
          </Flex>
        </FormControl>
        <Divider />
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
          onClose={onClose}
          primaryComp={primaryComp}
        />
      )}
    </>
  )
}

export default CompDetails
