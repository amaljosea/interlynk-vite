import { useLazyQuery, useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import React, { useContext, useEffect, useRef, useState } from 'react'
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
  Text
} from '@chakra-ui/react'

import CpeField from 'components/CpeField'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { UpdateComponent } from 'graphQL/Mutation'
import { CpeAutoComplete } from 'graphQL/Queries'

import { FaChevronDown, FaChevronRight } from 'react-icons/fa6'

import CpeInputs from './CpeInputs'
import PurlInputs from './PurlInputs'

const CompIdentifiers = ({ data }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid
  const customerView = location.pathname.startsWith('/customer')

  const { tabData, setTabData, handleChange, saveChanges } =
    useContext(TabContext)
  const { identifiers } = tabData

  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch

  const [updateComponent, { loading }] = useMutation(UpdateComponent)

  const cpeRef = useRef()
  const [cpeData, setCpeData] = useState([])
  const [purlData, setPurlData] = useState(null)
  const [isPURLInputValid, setPURLInputValid] = useState(true)
  const [purlOpen, setPurlOpen] = useState(false)
  const [cpeOpen, setCpeOpen] = useState(false)

  const handlePURLInputChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    handleChange('identifiers', 'purl', val)
  }

  const purlInputBlur = () => {
    if (identifiers?.purl !== '') {
      try {
        PackageURL.fromString(identifiers?.purl)
        setPURLInputValid(true)
      } catch (ex) {
        console.error('ex', ex)
        setPURLInputValid(false)
      }
    }
  }

  const handlePurlModal = () => {
    if (identifiers?.purl && identifiers?.isValidPurl) {
      const pkg = PackageURL.fromString(identifiers?.purl)
      setPurlData(pkg)
      setTabData((prev) => ({
        ...prev,
        identifiers: {
          ...prev.identifiers,
          purl: pkg.toString()
        }
      }))
    } else {
      setPurlData(null)
      setTabData((prev) => ({
        ...prev,
        identifiers: {
          ...prev.identifiers,
          purl: 'pkg:type/name@version'
        }
      }))
    }
    setPurlOpen(true)
  }

  const handleCpeChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    handleChange('identifiers', 'cpe', val)
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

  const isInvalid =
    (identifiers?.purl === '' && identifiers?.cpe === '') ||
    (identifiers?.purl !== '' &&
      !identifiers.isValidPurl &&
      identifiers?.cpe !== '' &&
      !identifiers.isValidCpe)

  const handleUpdateCom = () => {
    updateComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        purl: identifiers?.purl,
        cpes: identifiers?.cpe !== '' ? [identifiers?.cpe] : undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.componentUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        saveChanges()
        showToast({
          description: 'Identifiers updated successfully',
          status: 'success'
        })
        prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  useEffect(() => {
    if (data) {
      const { cpes, purl } = data || ''
      if (purl) {
        setTabData((prev) => ({
          ...prev,
          identifiers: { ...prev.identifiers, purl: purl }
        }))
        try {
          PackageURL.fromString(purl)
          setTabData((prev) => ({
            ...prev,
            identifiers: { ...prev?.identifiers, isValidPurl: true }
          }))
        } catch (ex) {
          setTabData((prev) => ({
            ...prev,
            identifiers: { ...prev?.identifiers, isValidPurl: false }
          }))
        }
      }

      if (cpes?.length > 0) {
        setTabData((prev) => ({
          ...prev,
          identifiers: { ...prev?.identifiers, cpe: cpes[0] }
        }))
        const matches = validateCpe(cpes[0])
        if (matches && cpes[0] !== '') {
          setTabData((prev) => ({
            ...prev,
            identifiers: { ...prev?.identifiers, isValidCpe: true }
          }))
        } else {
          setTabData((prev) => ({
            ...prev,
            identifiers: { ...prev?.identifiers, isValidCpe: false }
          }))
        }
      }
    }
  }, [data, prodCompDispatch, setTabData])

  return (
    <Stack
      px={6}
      spacing={4}
      direction={'column'}
      height={cpeOpen || purlOpen ? '100%' : '70vh'}
    >
      {/* PURL INPUI */}
      {purlOpen && (
        <PurlInputs
          getCpe={getCpe}
          data={purlData}
          activeComp={data}
          setIsValid={setPURLInputValid}
          onClose={() => setPurlOpen(false)}
        />
      )}
      <FormControl
        hidden={purlOpen}
        isReadOnly={customerView}
        isInvalid={identifiers?.purl && !identifiers?.isValidPurl}
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
            value={identifiers?.purl}
            autoComplete='off'
            onChange={handlePURLInputChange}
            onBlur={purlInputBlur}
          />
          <InputRightElement align='center' zIndex={-1}>
            {identifiers?.purl != null && identifiers?.purl !== '' ? (
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
              as={cpeOpen ? FaChevronDown : FaChevronRight}
            />
            <Text>CPE</Text>
          </Flex>
        </FormLabel>
        <CpeField
          inputRef={cpeRef}
          cpeList={cpeData}
          setCpeList={setCpeData}
          onChange={handleCpeChange}
        />
      </FormControl>
      <Divider />
      {/* ACTIONS */}
      <Button
        colorScheme='blue'
        variant='outline'
        width={'fit-content'}
        hidden={purlOpen || cpeOpen}
        onClick={handleUpdateCom}
        isDisabled={loading || isInvalid}
      >
        Save
      </Button>
    </Stack>
  )
}

export default CompIdentifiers
