import { useQuery } from '@apollo/client'
import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import ChangelogTable from 'components/Tables/ChangelogTable'
import { GetProjectLogs } from 'graphQL/Queries'
import { useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const ChangeLog = () => {
  const location = useLocation()
  const history = useHistory()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')

  const { data, refetch } = useQuery(GetProjectLogs, {
    variables: {
      id: id,
      field: 'ACTIVITY_LOGS_CREATED_AT',
      direction: 'DESC'
    }
  })

  useEffect(() => {
    if (!idRegex.test(id)) {
      history.push(`/vendor/products`)
    }
  }, [id])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '74px' }} px={4}>
      <Card>
        <ChangelogTable data={data?.project.activityLogs} refetch={refetch} />
      </Card>
    </Flex>
  )
}

export default ChangeLog
