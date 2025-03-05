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
      setPurlValue('')
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
        {/* PURL INPUI */}
        {purlOpen ? (
          <PurlEditor
            isOpen={purlOpen}
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
        {alert ? (
          <Stack spacing={4}>
            <LynkAlert
              status='warning'
              msg='Saving will apply changes to this tab only. save other tabs separately to retain their data.'
            />
            <ActionButton
              title={'Save'}
              isLoading={loading}
              onClick={handleUpdateCom}
              hidden={purlOpen || cpeOpen}
            />
          </Stack>
        ) : (
          <ActionButton
            title={'Save'}
            isLoading={loading}
            onClick={handleSubmit}
            hidden={purlOpen || cpeOpen || isCustomerView}
          />
        )}
      </Stack>
    </>
  )
}

export default CompIdentifiers
