import { Link, useNavigate, useParams } from 'react-router-dom'
import { linkURl } from 'utils'

import { Box, Flex, Text, Tooltip } from '@chakra-ui/react'

import ExternalNavIcon from 'components/Icons/ExternalNavIcon'

import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

const VulnIDetaills = ({ index, data }) => {
  const params = useParams()
  const navigate = useNavigate()
  const partsContext = usePartsContext()
  const { isCustomerView } = useRouteFlags()
  const { generateProductVulnerabilityDetailPageUrlFromCurrentUrl: getUrl } =
    useProductUrlContext()
  const { primaryBlueText, primaryTextColor } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor'
  ])

  const { id, vulnId, nvdAliasId } = data || {}

  const onGlobalView = (id, vuln) => {
    if (isCustomerView) return null

    localStorage.setItem('activeVuln', vuln)
    navigate(`/vendor/vulnerabilities?vulnId=${id}`)
  }

  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'
  const link = params?.productgroupid
    ? getUrl({ vulnerabilityid: id })
    : `/${path}/vulnerabilities?tab=productVulnerabilities&vulnId=${id}`

  return (
    <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
      <Tooltip label={vulnId || nvdAliasId}>
        {params?.sbomid ? (
          <Text
            fontSize={14}
            id={`vuln${index}`}
            fontWeight={'medium'}
            onClick={() => onGlobalView(id, vulnId)}
            color={isCustomerView ? primaryTextColor : primaryBlueText}
          >
            {nvdAliasId || vulnId}
          </Text>
        ) : (
          <Link
            to={link}
            onClick={() => localStorage.setItem('activeVuln', vulnId)}
          >
            <Text fontSize={14} color={primaryBlueText}>
              {nvdAliasId || vulnId}
            </Text>
          </Link>
        )}
      </Tooltip>
      {nvdAliasId && (
        <Tooltip label='View at NVD'>
          <Box>
            <ExternalNavIcon
              href={linkURl('nvd', vulnId)}
              onClick={() => (params?.sbomid ? partsContext.push() : null)}
            />
          </Box>
        </Tooltip>
      )}
      {nvdAliasId && (
        <Tooltip label='View at OSV'>
          <Box>
            <ExternalNavIcon href={linkURl('osv', nvdAliasId)} />
          </Box>
        </Tooltip>
      )}
    </Flex>
  )
}

export default VulnIDetaills
