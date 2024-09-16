import { useLazyQuery, useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { validateCpe } from 'utils'

import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import {
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
import LynkError from 'components/LynkError'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { UpdateComponent } from 'graphQL/Mutation'
import { CpeAutoComplete } from 'graphQL/Queries'

import { FaChevronDown, FaChevronRight } from 'react-icons/fa6'

import ActionButton from './ActionButton'
import CpeInputs from './CpeInputs'
import PurlInputs from './PurlInputs'

const CompIdentifiers = ({ data }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid
  const customerView = location.pathname.startsWith('/customer')

  const {
    tabData,
    setTabData,
    handleChange,
    saveChanges,
    unsavedChanges,
    alert,
    setAlert
  } = useContext(TabContext)
  const { identifiers } = tabData

  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch

  const [updateComponent, { loading }] = useMutation(UpdateComponent)

  const cpeRef = useRef()
  const [purlValue, setPurlValue] = useState('')
  const [cpeValue, setCpeValue] = useState('')
  const [cpeData, setCpeData] = useState([])
  const [purlOpen, setPurlOpen] = useState(false)
  const [cpeOpen, setCpeOpen] = useState(false)

  const handlePURLInputChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    handleChange('identifiers', 'purl', val)
  }

  const purlInputBlur = (e) => {
    if (e.target.value !== '') {
      try {
        PackageURL.fromString(e.target.value)
        handleChange('identifiers', 'isValidPurl', true)
      } catch (ex) {
        console.error('ex', ex)
        handleChange('identifiers', 'isValidPurl', false)
      }
    }
  }

  const handlePurlModal = () => {
    setPurlValue(identifiers?.purl || 'pkg:type/name@version')
    setPurlOpen(true)
  }

  const handleCpeModal = () => {
    setCpeValue(identifiers?.cpe || 'cpe:2.3:*:*:*:*:*:*:*:*:*:*:*')
    setCpeOpen(true)
  }

  const handleCpeChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    handleChange('identifiers', 'cpe', val)
    const matches = validateCpe(val)
    if (matches) {
      handleChange('identifiers', 'isValidCpe', true)
    } else {
      handleChange('identifiers', 'isValidCpe', false)
    }
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

  const checkData = () => {
    const { identifiers, ...rest } = unsavedChanges
    return Object.values(rest).some((value) => value === true)
  }

  const handleSubmit = () => {
    if (checkData()) {
      setAlert(true)
    } else {
      handleUpdateCom()
    }
  }

  useEffect(() => {
    if (!data) return
    const { cpes, purl } = data || {}

    // HANDLE PURL
    const updatePurl = (isValidPurl) => {
      setTabData((prev) => ({
        ...prev,
        identifiers: { ...prev.identifiers, purl: purl || '', isValidPurl }
      }))
    }
    if (purl) {
      try {
        PackageURL.fromString(purl)
        updatePurl(true)
      } catch (ex) {
        updatePurl(false)
      }
    } else {
      updatePurl(true)
    }

    // HANDLE CPE
    const cpe = cpes?.[0] || ''
    const isValidCpe = cpe && validateCpe(cpe)
    setTabData((prev) => ({
      ...prev,
      identifiers: {
        ...prev.identifiers,
        cpe,
        isValidCpe: Boolean(isValidCpe)
      }
    }))
  }, [data, setTabData])

  return (
    <>
      <Stack
        px={6}
        spacing={4}
        direction={'column'}
        height={cpeOpen || purlOpen ? '100%' : '70vh'}
      >
        {/* PURL INPUI */}
        {purlOpen && (
          <PurlInputs
            activeComp={data}
            value={purlValue}
            setValue={setPurlValue}
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
              onBlur={purlInputBlur}
              onChange={handlePURLInputChange}
            />
            <InputRightElement align='center' zIndex={-1}>
              {identifiers?.purl != null && identifiers?.purl !== '' ? (
                identifiers?.isValidPurl ? (
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
            value={cpeValue}
            setValue={setCpeValue}
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
                onClick={handleCpeModal}
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
        {alert ? (
          <Stack spacing={4}>
            <LynkError
              status='warning'
              error='Saving will apply changes to this tab only. save other tabs separately to retain their data.'
            />
            <ActionButton
              title={'Save Identifiers'}
              onClick={handleUpdateCom}
              hidden={purlOpen || cpeOpen}
              isDisabled={loading || isInvalid}
            />
          </Stack>
        ) : (
          <ActionButton
            title={'Save'}
            onClick={handleSubmit}
            hidden={purlOpen || cpeOpen}
            isDisabled={loading || isInvalid}
          />
        )}
      </Stack>
    </>
  )
}

export default CompIdentifiers
