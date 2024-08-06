import { useLazyQuery, useMutation } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { validateCpe } from 'utils'

import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react'

import CpeField from 'components/CpeField'
import ActionWrapper from 'components/Misc/ActionWrapper'

import { useGlobalState } from 'hooks/useGlobalState'

import { CreateComponent } from 'graphQL/Mutation'
import { UpdateComponent } from 'graphQL/Mutation'
import { CpeAutoComplete } from 'graphQL/Queries'

import { FaChevronDown, FaChevronRight } from 'react-icons/fa6'

import CpeInputs from './CpeInputs'
import PurlInputs from './PurlInputs'

const CompIdentifiers = (props) => {
  const { onClose, data, refetch } = props
  const toast = useToast()
  const params = useParams()
  const sbomId = params.sbomid
  const customerView = location.pathname.startsWith('/customer')

  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch

  const onRefetch = () => {
    refetch()
    onClose()
  }

  const [createComponent] = useMutation(CreateComponent, {
    onCompleted: (data) => data && onRefetch()
  })
  const [updateComponent] = useMutation(UpdateComponent, {
    onCompleted: (data) => data && onRefetch()
  })

  const cpeRef = useRef()
  const [cpeValue, setCpeValue] = useState('')
  const [cpeData, setCpeData] = useState([])
  const [purlValue, setPurlValue] = useState('')
  const [purlData, setPurlData] = useState(null)
  const [isPURLInputValid, setPURLInputValid] = useState(true)
  const [purlOpen, setPurlOpen] = useState(false)
  const [cpeOpen, setCpeOpen] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const disableButtonTemporarily = () => {
    setDisabled(true)
    setTimeout(() => {
      setDisabled(false)
    }, 3000)
  }

  // const onCheck = (title) => {
  //   const result = infoData.find((item) => item?.title === title)
  //   return result?.desc
  // }

  const handlePURLInputChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    setPurlValue(val)
  }

  const purlInputBlur = () => {
    if (purlValue !== '') {
      try {
        PackageURL.fromString(purlValue)
        setPURLInputValid(true)
      } catch (ex) {
        console.error('ex', ex)
        setPURLInputValid(false)
      }
    }
  }

  const handlePurlModal = () => {
    if (purlValue && purlValue !== '' && isPURLInputValid) {
      const pkg = PackageURL.fromString(purlValue)
      setPurlData(pkg)
      prodCompDispatch({ type: 'SET_PURL_STRING', payload: pkg.toString() })
    } else {
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: 'pkg:type/name@version?key=value'
      })
    }
    setPurlOpen(true)
  }

  const handleCpeChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    setCpeValue(val)
    getCpe({
      variables: {
        input: { idType: 'cpe', ecosystem: 'cpe', search: { idUri: val } }
      }
    }).then((res) => {
      if (res?.data) {
        setCpeData(res?.data?.idAutoComplete?.result || [])
      }
    })
  }

  const handleCreateCom = () => {
    disableButtonTemporarily()
    createComponent({
      variables: {
        sbomId: sbomId,
        cpes: cpeValue !== '' ? [cpeValue] : [],
        purl: purlValue
      }
    })
      .then((res) => {
        if (res.data) {
          prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
        }
      })
      .finally(() => {
        onClose()
      })
  }

  const handleUpdateCom = () => {
    disableButtonTemporarily()
    updateComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        cpes: cpeValue !== '' ? [cpeValue] : [],
        purl: purlValue
      }
    }).then((res) => {
      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length > 0) {
        toast({ description: errors[0], status: 'error', position: 'top' })
      } else {
        prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
        onClose()
      }
    })
  }

  useEffect(() => {
    if (data) {
      const { cpes, purl } = data || ''
      if (purl !== null) {
        setPurlValue(purl)
        try {
          PackageURL.fromString(purl)
          setPURLInputValid(true)
        } catch (ex) {
          setPURLInputValid(false)
        }
      } else {
        setPurlValue('')
        setPURLInputValid(true)
      }
      if (cpes?.length > 0) {
        setCpeValue(cpes[0])
        const matches = validateCpe(cpes[0])
        if (matches && cpes[0] !== '') {
          prodCompDispatch({ type: 'SET_CPE_VALIDATION', payload: true })
        } else {
          prodCompDispatch({ type: 'SET_CPE_VALIDATION', payload: false })
        }
      }
    }
  }, [data, prodCompDispatch])

  return (
    <Stack
      px={6}
      pb={10}
      spacing={4}
      direction={'column'}
      height={cpeOpen ? '100%' : '80vh'}
    >
      {/* PURL INPUI */}
      {purlOpen && (
        <PurlInputs
          getCpe={getCpe}
          data={purlData}
          activeComp={data}
          setPurlValue={setPurlValue}
          setIsValid={setPURLInputValid}
          onClose={() => setPurlOpen(false)}
        />
      )}
      <FormControl
        hidden={purlOpen}
        isReadOnly={customerView}
        isInvalid={purlValue !== '' && !isPURLInputValid}
      >
        <FormLabel htmlFor='purl' fontSize={'sm'}>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
            <Icon
              fontSize={12}
              color={'#718096'}
              cursor={'pointer'}
              onClick={handlePurlModal}
              display={customerView ? 'none' : 'flex'}
              as={purlOpen ? FaChevronDown : FaChevronRight}
            />
            <Text>Package URL {`(PURL)`}</Text>
          </Flex>
        </FormLabel>
        <InputGroup>
          <Input
            type='text'
            size='md'
            id='purl'
            name='purl'
            fontSize={'sm'}
            placeholder='PURL'
            value={purlValue}
            autoComplete='off'
            onChange={handlePURLInputChange}
            onBlur={purlInputBlur}
          />
          <InputRightElement align='center' zIndex={-1}>
            {purlValue != null && purlValue !== '' ? (
              isPURLInputValid ? (
                <CheckIcon color='green' />
              ) : (
                <WarningTwoIcon color='red' />
              )
            ) : null}
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Divider />
      {/* CPE INPUT */}
      {cpeOpen && (
        <CpeInputs
          data={cpeData}
          getCpe={getCpe}
          activeComp={data}
          cpeValue={cpeValue}
          setCpeValue={setCpeValue}
          onClose={() => setCpeOpen(false)}
        />
      )}
      <FormControl hidden={cpeOpen}>
        <FormLabel htmlFor='cpe' fontSize={'sm'}>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
            <Icon
              fontSize={12}
              color={'#718096'}
              cursor={'pointer'}
              onClick={() => setCpeOpen(true)}
              display={customerView ? 'none' : 'flex'}
              as={purlOpen ? FaChevronDown : FaChevronRight}
            />
            <Text>CPE</Text>
          </Flex>
        </FormLabel>
        <CpeField
          inputRef={cpeRef}
          inputValue={cpeValue}
          setInputValue={setCpeValue}
          cpeList={cpeData}
          setCpeList={setCpeData}
          onChange={handleCpeChange}
        />
      </FormControl>
      <br />
      {/* ACTIONS */}
      <ActionWrapper hidden={cpeOpen || purlOpen}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          colorScheme='blue'
          width={'fit-content'}
          hidden={purlOpen || cpeOpen}
          onClick={data ? handleUpdateCom : handleCreateCom}
          isDisabled={disabled}
        >
          Save
        </Button>
      </ActionWrapper>
    </Stack>
  )
}

export default CompIdentifiers
