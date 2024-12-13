import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import useQueryParam from 'hooks/useQueryParam'

import { GetLabels } from 'graphQL/Queries'

const LabelSelect = ({ value, onChange }) => {
  const location = useLocation()
  const tab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()
  const [options, setOptions] = useState([])

  const enabled =
    location?.pathname === '/vendor/analytics' ||
    tab === 'parts' ||
    tab === 'vulnerabilities'

  const { data, loading } = useQuery(GetLabels, {
    skip: enabled && orgView ? false : true,
    variables: { first: 500 }
  })
  const { nodes } = data?.labels || ''

  useEffect(() => {
    if (nodes?.length > 0) {
      setOptions(() =>
        nodes?.map((item) => ({ label: item?.name, value: item?.id }))
      )
    }
  }, [nodes])

  return (
    <FormControl>
      <FormLabel htmlFor='phases'>Label</FormLabel>
      <LynkSelect
        value={value}
        options={options}
        isClearable={true}
        isLoading={loading}
        isSearchable={true}
        onChange={onChange}
        name='Product Label'
        placeholder={'Add label'}
      />
    </FormControl>
  )
}

export default LabelSelect
