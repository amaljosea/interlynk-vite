import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ChangelogTable from 'components/Tables/ChangelogTable'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const ChangeLog = ({ data, refetch, activeEnv }) => {
  const navigate = useNavigate()
  const params = useParams()
  const id = params.productid

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
