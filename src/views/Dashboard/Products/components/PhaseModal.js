import { gql, useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { sbomPhases } from 'variables/general'

import { Flex, FormControl, FormLabel } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { FaWrench } from 'react-icons/fa6'

const UpdatePhases = gql`
  mutation UpdatePhases($id: Uuid!, $phases: [PhaseInput!]) {
    sbomUpdate(input: { id: $id, phases: $phases }) {
      sbom {
        id
        phases
      }
      errors
    }
  }
`

const PhaseModal = ({ data, isOpen, onClose }) => {
  const params = useParams()
  const { showToast } = useCustomToast()
  const [updatePhase, { loading }] = useMutation(UpdatePhases)

  const [phases, setPhases] = useState([])
  const [error, setError] = useState('')

  const onPhaseChange = (value) => {
    setPhases(value)
  }

  const handleSubmit = () => {
    const lifecycles =
      phases?.length > 0 ? phases?.map((item) => ({ name: item?.value })) : []
    updatePhase({ variables: { id: params?.sbomid, phases: lifecycles } }).then(
      (res) => {
        if (res?.data?.sbomUpdate?.errors?.length > 0) {
          setError(res?.data?.sbomUpdate?.errors[0])
        } else {
          showToast({
            description: 'Phases updated successfully',
            status: 'success'
          })
          onClose()
        }
      }
    )
  }

  useEffect(() => {
    if (data?.length > 0) {
      setPhases(() => data?.map((item) => ({ label: item, value: item })))
    }
  }, [data])

  return (
    <LynkModal
      isOpen={isOpen}
      Icon={FaWrench}
      onClose={onClose}
      isLoading={loading}
      buttonText={'Save'}
      onSubmit={handleSubmit}
      disabled={phases?.length === 0}
      title={`${data?.length > 0 ? 'Update' : 'Add'} Phase`}
    >
      <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
        {error && <LynkAlert msg={error} />}
        <FormControl>
          <FormLabel htmlFor='phases' fontSize={'sm'}>
            Phases
          </FormLabel>
          <LynkSelect
            isMulti={true}
            value={phases}
            name='compPhases'
            isClearable={true}
            isSearchable={true}
            options={sbomPhases}
            onChange={onPhaseChange}
            placeholder={'Add phase'}
          />
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default PhaseModal
