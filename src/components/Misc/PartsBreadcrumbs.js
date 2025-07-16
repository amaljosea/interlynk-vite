import React from 'react'
import { useNavigate } from 'react-router-dom'
import { truncatedValue } from 'utils'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuArrowRight } from 'react-icons/lu'

const PartsBreadcrumbs = ({ projectGroupId }) => {
  const navigate = useNavigate()
  const partsContext = usePartsContext()
  const { sbomHookData } = useGlobalQueryContext()

  const { primaryBlueText, secondaryTextInverse } = useThemeColor([
    'primaryBlueText',
    'secondaryTextInverse'
  ])

  const { name: projectGroupName, loading: projectGroupLoading } =
    useProjectGroup({ projectGroupId })

  const handleClick = (part, index) => {
    if (part?.url) {
      partsContext.goTo(index)
      navigate(part?.url)
    }
  }

  return (
    <Breadcrumb
      fontSize={'sm'}
      separator={<LuArrowRight size={18} color={secondaryTextInverse} />}
    >
      {!projectGroupLoading &&
        partsContext.isParts &&
        [
          ...partsContext.parts,
          {
            url: null,
            projectGroupName: projectGroupName,
            versionName: sbomHookData?.versionName
          }
        ].map((part, index) => {
          return (
            <BreadcrumbItem
              key={part?.url}
              cursor={'pointer'}
              color={primaryBlueText}
              isCurrentPage={!!part?.url}
            >
              <BreadcrumbLink
                _hover={{ textDecoration: 'none' }}
                onClick={() => handleClick(part, index)}
              >
                {truncatedValue(part?.projectGroupName)} (
                {truncatedValue(part?.versionName)})
              </BreadcrumbLink>
            </BreadcrumbItem>
          )
        })}
    </Breadcrumb>
  )
}

export default PartsBreadcrumbs
