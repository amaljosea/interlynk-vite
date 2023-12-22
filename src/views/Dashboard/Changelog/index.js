import { useQuery } from '@apollo/client'
import ChangelogTable from 'components/Tables/ChangelogTable'
import { GetProjectLogs } from 'graphQL/Queries'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const ChangeLog = ({ data, refetch }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')


  useEffect(() => {
    if (!idRegex.test(id)) {
      navigate(`/vendor/products`)
    }
  }, [id])

  return <ChangelogTable data={data?.project.activityLogs} refetch={refetch} />
}

export default ChangeLog
