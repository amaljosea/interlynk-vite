import { useQuery } from '@apollo/client'
import { Outlet, useNavigate, useParams } from 'react-router-dom'

import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { ShareLynkProjectGroupExists } from 'graphQL/Queries'

function Index() {
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const navigate = useNavigate()
  const params = useParams()
  const productGroupId = params.productgroupid

  useQuery(ShareLynkProjectGroupExists, {
    skip: productGroupId ? false : true,
    variables: { id: productGroupId },
    onCompleted: (data) => {
      if (data?.shareLynkQuery?.productGroup) {
        navigate(
          generateProductDetailPageUrlFromCurrentUrl({
            productgroupid: productGroupId
          })
        )
      }
    }
  })

  return <Outlet />
}

export default Index
