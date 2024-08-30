import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { recheckHealth } from 'graphQL/Mutation'

import { FaCheckDouble } from 'react-icons/fa6'

const RunChecks = ({ isOpen, onClose }) => {
  const params = useParams()
  const { showToast } = useCustomToast()
  const [healthRecheck] = useMutation(recheckHealth)

  const handleSave = () => {
    showToast({
      description: 'Checks rescan is in progress',
      status: 'info'
    })
    healthRecheck({
      variables: {
        sbomId: params?.sbomid
      }
    }).then((res) => {
      if (res?.data) {
        showToast({
          description: 'Health re-check successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSave}
      title={`Run Checks`}
      Icon={FaCheckDouble}
      buttonText={'Run'}
    >
      <Text>Run checks to see compliance scores</Text>
    </LynkModal>
  )
}

export default RunChecks
