import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
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
  chakra
} from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { UpdateComponent } from 'graphQL/Mutation'
import { GetAllSboms } from 'graphQL/Queries'

const CompDetails = ({ data }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const location = useLocation()
  const productId = params.productid
  const sbomId = params.sbomid
  const customerView = location.pathname.startsWith('/customer')

  const { prodCompState, dispatch } = useGlobalState()
  const { expLicense } = prodCompState
  const { prodCompDispatch } = dispatch

  const [updateComponent] = useMutation(UpdateComponent)

  const [groupInfo, setGroupInfo] = useState('')
  const [compName, setCompName] = useState('')
  const [compDesc, setCompDesc] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compKind, setCompKind] = useState('')
  const [compScope, setCompScope] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [isInternal, setIsInternal] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const disableButtonTemporarily = () => {
    setDisabled(true)
    setTimeout(() => {
      setDisabled(false)
    }, 3000)
  }

  let isExists
  useQuery(GetAllSboms, {
    fetchPolicy: 'network-only',
    skip: customerView,
    variables: {
      id: productId
    },
    onCompleted: (data) => {
      if (data) {
        const result = data?.project?.sboms?.map((item) => item?.projectVersion)
        isExists = result
      }
    }
  })

  useEffect(() => {
    if (data) {
      setGroupInfo(data?.group)
      setCompName(data?.name)
      setCompDesc(data?.description)
      setCompVersion(data?.version)
      setCompKind(data?.kind)
      setCompScope(data?.scope)
      setIsPrimary(data?.primary)
      setIsInternal(data?.internal)
    }
  }, [data])

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  const handleUpdateCom = () => {
    disableButtonTemporarily()
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

  const isInvalid =
    compKind === '' || compName === '' || compVersion === '' || disabled

  return (
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
      <FormControl
        isReadOnly={customerView}
        isInvalid={data?.version !== compVersion && isExists}
      >
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
      {/* PRIMARY COMPONENT */}
      <FormControl isReadOnly={customerView}>
        <Flex alignItems={'center'} gap={2}>
          <Checkbox
            size='sm'
            colorScheme='blue'
            isChecked={isPrimary}
            onChange={() => setIsPrimary(!isPrimary)}
          >
            Primary component
          </Checkbox>
          <Tooltip label={onCheck(`Primary Component`)}>
            <InfoIcon color={'blue.500'} />
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
            <InfoIcon color={'blue.500'} />
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
  )
}

export default CompDetails
