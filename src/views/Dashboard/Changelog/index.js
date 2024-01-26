import ChangelogTable from 'components/Tables/ChangelogTable'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const ChangeLog = ({ data, refetch, activeEnv }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')

  useEffect(() => {
    if (!idRegex.test(id)) {
      navigate(`/vendor/products`)
    }
  }, [id])

  return (
    <ChangelogTable
      data={data?.project?.activityLogs}
      refetch={refetch}
      activeEnv={activeEnv}
    />
  )
}

export default ChangeLog
