import { Link, useNavigate, useParams } from 'react-router-dom'
import { linkURl } from 'utils'

import { Box, Flex, Text, Tooltip } from '@chakra-ui/react'

import ExternalNavIcon from 'components/Icons/ExternalNavIcon'

import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

const VulnDetaills = ({ index, data }) => {
  const params = useParams()
  const navigate = useNavigate()
  const partsContext = usePartsContext()
  const ID = useQueryParam('vulnId')
  const { isCustomerView } = useRouteFlags()
  const { generateProductVulnerabilityDetailPageUrlFromCurrentUrl: getUrl } =
    useProductUrlContext()
  const { primaryBlueText, primaryTextColor } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor'
  ])

  const { id, vulnId, nvdAliasId } = data || {}

  const onGlobalView = (id) => {
    if (isCustomerView) return null
    localStorage.setItem('activeVuln', nvdAliasId || vulnId)
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
            onClick={() => onGlobalView(id)}
            color={isCustomerView ? primaryTextColor : primaryBlueText}
          >
            {nvdAliasId || vulnId}
          </Text>
        ) : (
          <Link
            to={link}
            onClick={() =>
              localStorage.setItem('activeVuln', nvdAliasId || vulnId)
            }
          >
            <Text
              color={primaryBlueText}
              fontSize={!ID ? 14 : 20}
              fontWeight={!ID ? 'normal' : 'medium'}
            >
              {nvdAliasId || vulnId}
            </Text>
          </Link>
        )}
      </Tooltip>
      <Tooltip label='View at NVD'>
        <Box>
          <ExternalNavIcon
            size={!ID ? 4 : 5}
            href={linkURl('nvd', vulnId)}
            onClick={() => (params?.sbomid ? partsContext.push() : null)}
          />
        </Box>
      </Tooltip>
      {nvdAliasId && (
        <Tooltip label='View at OSV'>
          <Box>
            <ExternalNavIcon
              size={!ID ? 4 : 5}
              href={linkURl('osv', nvdAliasId)}
            />
          </Box>
        </Tooltip>
      )}
    </Flex>
  )
}

export default VulnDetaills
