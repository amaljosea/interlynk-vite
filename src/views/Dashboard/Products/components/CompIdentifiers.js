import { useLazyQuery, useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isCustomerView, validateCpe } from 'utils'

import {
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'

import CpeField from 'components/CpeField'
import LynkAlert from 'components/LynkAlert'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

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
  const customerView = isCustomerView()

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

  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

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
    handleChange('identifiers', 'purlError', '')
  }

  const purlInputBlur = (e) => {
    if (e.target.value !== '') {
      try {
        PackageURL.fromString(e.target.value)
        handleChange('identifiers', 'purlError', '')
      } catch (ex) {
        console.error('ex', ex.message)
        handleChange('identifiers', 'purlError', ex.message)
      }
    }
  }

  const handlePurlModal = () => {
    try {
      PackageURL.fromString(identifiers?.purl)
      setPurlValue(identifiers?.purl)
    } catch (ex) {
      setPurlValue('pkg:type/name@version')
    }
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
    handleChange('identifiers', 'cpeError', '')
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

  const handleUpdateCom = () => {
    updateComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        purl: identifiers?.purl,
        cpes: identifiers?.cpe !== '' ? [identifiers?.cpe] : []
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
    // eslint-disable-next-line no-unused-vars
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
    const updatePurl = (msg) => {
      setTabData((prev) => ({
        ...prev,
        identifiers: {
          ...prev.identifiers,
          purl: purl ? decodeURI(purl) : '',
          purlError: msg
        }
      }))
    }

    if (purl) {
      try {
        PackageURL.fromString(decodeURI(purl))
        updatePurl('')
      } catch (ex) {
        updatePurl(ex?.message)
      }
    } else {
      updatePurl(true)
    }

    // HANDLE CPE
    const cpe = cpes?.[0] || ''
    const isValid = cpe && validateCpe(cpe)
    setTabData((prev) => ({
      ...prev,
      identifiers: {
        ...prev.identifiers,
        cpe,
        cpeError: isValid ? '' : 'Invalid CPE'
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
            value={purlValue}
            setValue={setPurlValue}
            onClose={() => setPurlOpen(false)}
          />
        )}
        <FormControl
          hidden={purlOpen}
          isReadOnly={customerView}
          isInvalid={identifiers?.purl !== '' && identifiers?.purlError !== ''}
        >
          <FormLabel htmlFor='purl' fontSize={'sm'}>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
              <Icon
                data-testid='purl_expand'
                onClick={handlePurlModal}
                display={customerView ? 'none' : 'flex'}
                as={purlOpen ? FaChevronDown : FaChevronRight}
                sx={{
                  fontSize: 12,
                  color: sameSecondaryText,
                  cursor: 'pointer'
                }}
              />
              <Text>Package URL {`(PURL)`}</Text>
            </Flex>
          </FormLabel>
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
          <FormErrorMessage>{identifiers?.purlError}</FormErrorMessage>
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
                data-testid='cpe_expand'
                onClick={handleCpeModal}
                display={customerView ? 'none' : 'flex'}
                as={cpeOpen ? FaChevronDown : FaChevronRight}
                sx={{
                  fontSize: 12,
                  color: sameSecondaryText,
                  cursor: 'pointer'
                }}
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
            <LynkAlert
              status='warning'
              msg='Saving will apply changes to this tab only. save other tabs separately to retain their data.'
            />
            <ActionButton
              title={'Save Identifiers'}
              onClick={handleUpdateCom}
              hidden={purlOpen || cpeOpen}
              isDisabled={loading}
            />
          </Stack>
        ) : (
          <ActionButton
            title={'Save'}
            onClick={handleSubmit}
            isDisabled={loading}
            hidden={purlOpen || cpeOpen || customerView}
          />
        )}
      </Stack>
    </>
  )
}

export default CompIdentifiers
