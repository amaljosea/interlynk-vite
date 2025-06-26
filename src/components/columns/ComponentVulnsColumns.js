import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getFullDate, timeSince } from 'utils'
import { statusColor } from 'utils/styleUtils'

import {
  Flex,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  Tooltip
} from '@chakra-ui/react'

import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuBan, LuFolderTree } from 'react-icons/lu'

const ComponentVulnsColumns = ({ handlePreview }) => {
  const params = useParams()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { primaryBlueText, primaryTextColor, secondaryTextColor } =
    useThemeColor(['primaryBlueText', 'primaryTextColor', 'secondaryTextColor'])

  return useMemo(() => {
    const columns = [
      // PRODUCTS
      {
        id: 'PRODUCT_GROUP',
        name: 'PRODUCT',
        selector: (row) => {
          const { component } = row
          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            productgroupid: component?.sbom?.project?.projectGroup?.id,
            productid: component?.sbom?.project?.id,
            sbomid: component?.sbom?.id,
            paramsObj: {
              tab: 'components'
            },
            replaceParams: true
          })
          return (
            <Flex flexDir={'row'} my={3} gap={2} alignItems={'center'}>
              <Tooltip label='Also affected'>
                <IconButton
                  size='xs'
                  colorScheme='blue'
                  icon={<LuFolderTree size={16} />}
                  onClick={() => handlePreview(row)}
                  isDisabled={!component?.sbom?.hasConnectedSboms}
                />
              </Tooltip>
              <Link to={link}>
                <Text fontSize={14} color={primaryBlueText}>
                  {component?.sbom?.project?.projectGroup?.name || 'N/A'}
                </Text>
              </Link>
            </Flex>
          )
        },
        wrap: true,
        width: '15%',
        omit: params?.name ? true : false
      },
      // VERSION
      {
        id: 'PRODUCT_VERSIONN',
        name: 'VERSION',
        selector: (row) => (
          <Tooltip label={row?.component?.sbom?.projectVersion} placement='top'>
            <Text fontSize={14} color={primaryTextColor} my={2}>
              {row?.component?.sbom?.projectVersion}
            </Text>
          </Tooltip>
        ),
        wrap: true,
        width: '14%'
      },
      // VULN COMPONENT
      {
        id: 'COMPONENTS_NAME',
        name: 'COMPONENT',
        selector: (row) => {
          const { component } = row
          return (
            <Stack
              my={3}
              spacing={1}
              direction='column'
              alignItems={'flex-start'}
            >
              <Text fontSize={14} color={primaryTextColor}>
                {component?.name || 'N/A'}
              </Text>
              <Text fontSize={14} color={secondaryTextColor}>
                {component?.version || 'N/A'}
              </Text>
            </Stack>
          )
        },
        wrap: true,
        width: '26%'
      },
      // ENV
      {
        id: 'ENVIRONMENT',
        name: 'ENVIRONMENT',
        selector: (row) => {
          const { component } = row
          return (
            <Text
              fontSize={14}
              color={primaryTextColor}
              textTransform={'capitalize'}
            >
              {component?.sbom?.project?.name || 'N/A'}
            </Text>
          )
        },
        wrap: true,
        width: '12%'
      },
      // STATUS
      {
        id: 'VEX_STATUSES_NAME',
        name: 'STATUS',
        selector: (row) => {
          const { vexStatus, isComplete } = row
          return (
            <Tag
              variant={'subtle'}
              colorScheme={statusColor(vexStatus?.name || 'Unspecified')}
            >
              {isComplete === false && (
                <TagLeftIcon boxSize='14px' as={LuBan} />
              )}
              <TagLabel>{vexStatus?.name || 'Unspecified'}</TagLabel>
            </Tag>
          )
        },
        wrap: true
      },
      // UPDATED AT
      {
        id: 'VEX_UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => (
          <Tooltip label={getFullDate(row?.updatedAt)} placement={'top'}>
            <Text color={primaryTextColor}>{timeSince(row?.updatedAt)}</Text>
          </Tooltip>
        ),
        right: 'true',
        wrap: true
      }
    ]

    return columns
  }, [
    handlePreview,
    generateProductVersionDetailPageUrlFromCurrentUrl,
    params?.name,
    primaryBlueText,
    primaryTextColor,
    secondaryTextColor
  ])
}

export default ComponentVulnsColumns
