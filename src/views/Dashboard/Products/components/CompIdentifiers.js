import { useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isCustomerView } from 'utils'

import { Divider, Stack } from '@chakra-ui/react'

import CpeEditor from 'components/CpeEditor'
import CpeField from 'components/CpeField'
import LynkAlert from 'components/LynkAlert'
import PurlEditor from 'components/PurlEditor'
import PurlField from 'components/PurlField'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { UpdateComponent } from 'graphQL/Mutation'

import ActionButton from './ActionButton'

const CompIdentifiers = ({ data }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid
  const customerView = isCustomerView()

  const { tabData, setTabData, saveChanges, unsavedChanges, alert, setAlert } =
    useContext(TabContext)
  const { identifiers } = tabData

  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch

  const [updateComponent, { loading }] = useMutation(UpdateComponent)

  const [purlValue, setPurlValue] = useState('')
  const [cpeValue, setCpeValue] = useState('')
  const [purlOpen, setPurlOpen] = useState(false)
  const [cpeOpen, setCpeOpen] = useState(false)

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
    if (data) {
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
      if (cpes?.length > 0) {
        setTabData((prev) => ({
          ...prev,
          identifiers: {
            ...prev.identifiers,
            cpe: cpes[0]
          }
        }))
      }
    }
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
        {purlOpen ? (
          <PurlEditor
            value={purlValue}
            isOpen={purlOpen}
            setValue={setPurlValue}
            onOpen={() => setPurlOpen(true)}
            onClose={() => setPurlOpen(false)}
          />
        ) : (
          <PurlField
            isOpen={purlOpen}
            onOpen={handlePurlModal}
            onClose={() => setPurlOpen(false)}
          />
        )}
        <Divider />
        {/* CPE INPUT */}
        {cpeOpen ? (
          <CpeEditor
            value={cpeValue}
            isOpen={cpeOpen}
            setValue={setCpeValue}
            onOpen={() => setCpeOpen(true)}
            onClose={() => setCpeOpen(false)}
          />
        ) : (
          <CpeField
            isOpen={cpeOpen}
            onOpen={handleCpeModal}
            onClose={() => setCpeOpen(false)}
          />
        )}
        <Divider hidden={cpeOpen || purlOpen} />
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
            title={'Save Identifiers'}
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
