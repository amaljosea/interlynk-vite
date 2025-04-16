import { useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Stack } from '@chakra-ui/react'

import CpeEditor from 'components/CpeEditor'
import CpeField from 'components/CpeField'
import LynkAlert from 'components/LynkAlert'
import PurlEditor from 'components/PurlEditor'
import PurlField from 'components/PurlField'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useRouteFlags } from 'hooks/useRouteFlags'

import { UpdateComponent } from 'graphQL/Mutation'

import ActionButton from './ActionButton'

const CompIdentifiers = ({ data }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid
  const { isCustomerView } = useRouteFlags()

  const {
    tabData,
    setTabData,
    saveChanges,
    unsavedChanges,
    alert,
    setAlert,
    alertMessageSetter,
    alertMessage
  } = useContext(TabContext)

  const { identifiers } = tabData

  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch

  const [updateComponent, { loading }] = useMutation(UpdateComponent)

  const [cpeValue, setCpeValue] = useState('')
  const [purlOpen, setPurlOpen] = useState(false)
  const [cpeOpen, setCpeOpen] = useState(false)
  const [savePending, setSavePending] = useState('')

  const handlePurlModal = () => {
    setPurlOpen(true)
    setSavePending('')
  }

  const handleCpeModal = () => {
    setCpeValue(identifiers?.cpe || 'cpe:2.3:*:*:*:*:*:*:*:*:*:*:*')
    setCpeOpen(true)
    setSavePending('')
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
        saveChanges('identifiers')
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
    alertMessageSetter(rest)
    return Object.values(rest).some((value) => value === true)
  }

  const handleSubmit = () => {
    setSavePending('')
    handleUpdateCom()
    if (checkData()) {
      setAlert(true)
    }
  }

  useEffect(() => {
    if (data?.cpes && data?.cpes?.length > 0) {
      setTabData((prev) => ({
        ...prev,
        identifiers: {
          ...prev.identifiers,
          cpe: data?.cpes[0]
        }
      }))
    }
  }, [data?.cpes, setTabData])

  useEffect(() => {
    if (data?.purl) {
      try {
        const pkg = PackageURL.fromString(data?.purl)
        setTabData((prev) => ({
          ...prev,
          identifiers: {
            ...prev.identifiers,
            purl: pkg.toString()
          }
        }))
      } catch (error) {
        setTabData((prev) => ({
          ...prev,
          identifiers: {
            ...prev.identifiers,
            purlError: error?.message
          }
        }))
      }
    }
  }, [data?.purl, setTabData])

  return (
    <>
      <Stack
        spacing={4}
        direction={'column'}
        height={cpeOpen || purlOpen ? '100%' : '70vh'}
      >
        {alert && <LynkAlert status='warning' msg={alertMessage} />}
        {/* PURL INPUI */}
        {purlOpen ? (
          <PurlEditor
            isOpen={purlOpen}
            onOpen={() => setPurlOpen(true)}
            onClose={() => setPurlOpen(false)}
            setSavePending={setSavePending}
          />
        ) : (
          <PurlField
            isOpen={purlOpen}
            onOpen={handlePurlModal}
            onClose={() => setPurlOpen(false)}
          />
        )}
        {/* CPE INPUT */}
        {cpeOpen ? (
          <CpeEditor
            value={cpeValue}
            isOpen={cpeOpen}
            setValue={setCpeValue}
            onOpen={() => setCpeOpen(true)}
            onClose={() => setCpeOpen(false)}
            setSavePending={setSavePending}
          />
        ) : (
          <CpeField
            isOpen={cpeOpen}
            onOpen={handleCpeModal}
            onClose={() => setCpeOpen(false)}
          />
        )}
        <ActionButton
          title={'Save'}
          isLoading={loading}
          onClick={handleSubmit}
          hidden={purlOpen || cpeOpen || isCustomerView}
        />
        {savePending !== '' &&
          unsavedChanges.identifiers &&
          !purlOpen &&
          !cpeOpen && <LynkAlert status='warning' msg={savePending} />}
      </Stack>
    </>
  )
}

export default CompIdentifiers
