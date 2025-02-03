import { useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFullDate, timeSince } from 'utils'
import { truncatedValue } from 'utils'

import {
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Skeleton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetShareProductData } from 'graphQL/Queries'

import {
  FaAngleLeft,
  FaBalanceScale,
  FaBug,
  FaCube,
  FaCubes
} from 'react-icons/fa'

const SbomDetails = () => {
  const partsContext = usePartsContext()
  const navigate = useNavigate()
  const params = useParams()
  const projectId = params.productid
  const sbomId = params.sbomid
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const { primaryBlueText, secondaryBlueText, secondaryTextInverse } =
    useThemeColor([
      'primaryBlueText',
      'secondaryBlueText',
      'secondaryTextInverse'
    ])
  const setActiveTab = (value) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: value
      }
    })
    navigate(link)
  }
  const { dispatch } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const { data, loading } = useQuery(GetShareProductData, {
    variables: { sbomId: sbomId }
  })

  const {
    project,
    projectVersion,
    primaryComponent,
    updatedAt,
    lifecycle,
    stats
  } = data?.shareLynkQuery?.sbom || {}
  const { compCount, compLicenseCount, vulnStats } = stats || ''
  const { critical, high, medium, low, unknown } = vulnStats || ''

  const onSelectComp = () => {
    prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
    setActiveTab('components')
  }

  const onSelectVulns = () => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    setActiveTab('vulnerabilities')
  }

  const onSelectLicenses = () => {
    setActiveTab('licenses')
  }

  const onFilterVuln = (value) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    setActiveTab('vulnerabilities')
  }

  const handlePart = () => {
    partsContext.pop()
  }

  useEffect(() => {
    window.onpopstate = () => {
      console.log(`Pressed back button`)
      handlePart()
    }
  })

  if (loading) return <Skeleton width={'full'} height={8} />

  return (
    <>
      <Flex direction={'row'} alignItems={'flex-start'} gap={5} width={'100%'}>
        <Icon as={FaCubes} h={'64px'} w={'64px'} color={secondaryBlueText} />
        <Flex direction={'column'} gap={0.5}>
          {/* PRODUCT TITLE */}
          <Stack spacing={1} direction={'column'} alignItems={'left'}>
            {projectId && partsContext.latestPart && (
              <Link to={partsContext.latestPart.url} onClick={handlePart}>
                <HStack>
                  <FaAngleLeft size={18} color={primaryBlueText} />
                  <Text
                    width={'fit-content'}
                    fontWeight={'semibold'}
                    fontSize={18}
                    color={primaryBlueText}
                    textDecor={'underline'}
                  >
                    {partsContext.latestPart.projectGroupName}
                  </Text>
                </HStack>
              </Link>
            )}
            <Flex
              direction={'row'}
              alignItems={'center'}
              flexWrap={'wrap'}
              gap={2}
            >
              <Text fontWeight={'semibold'} fontSize={25} width={'fit-content'}>
                {truncatedValue(project?.projectGroup?.name, 36)}
              </Text>
            </Flex>
          </Stack>
          <Flex flexDir={'row'} gap={1} alignItems={'center'} flexWrap={'wrap'}>
            <Text fontSize={22}>{primaryComponent?.name}</Text>
            <Text fontSize={22}>{primaryComponent?.version ? ':' : ''}</Text>
            <Text mr={2} fontSize={22}>
              {projectVersion}
            </Text>
            <Tooltip label='Lifecycle stage' fontSize='md'>
              <Tag
                w={'fit-content'}
                size={'sm'}
                variant='solid'
                colorScheme='blue'
              >
                <TagLabel textTransform={'capitalize'}>{lifecycle}</TagLabel>
              </Tag>
            </Tooltip>
          </Flex>
          <Text fontSize={'sm'} my={1}>
            {primaryComponent?.description}
          </Text>
          {/* UPDATED AT */}
          <Tooltip placement='top' label={getFullDate(updatedAt)}>
            <Text width={'fit-content'} fontSize='xs' cursor={'pointer'}>
              Updated {timeSince(updatedAt)}
            </Text>
          </Tooltip>
          {/* STATS */}
          <Flex flexDir={'row'} alignItems={'center'} gap={8} mt={5}>
            {/* COMPONENTS */}
            <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
              <Icon
                h={4}
                w={4}
                mt={1}
                color={secondaryTextInverse}
                as={FaCube}
              />
              <Flex flexDir={'column'} alignItems={'center'}>
                <Tag
                  size='md'
                  variant='subtle'
                  width={'full'}
                  colorScheme={'blue'}
                  cursor={'pointer'}
                  onClick={onSelectComp}
                >
                  <TagLabel mx={'auto'}>{compCount}</TagLabel>
                </Tag>
                <Text
                  mt={1}
                  fontSize={'xs'}
                  cursor={'pointer'}
                  _hover={{ textDecoration: 'underline' }}
                  onClick={onSelectComp}
                >
                  Components
                </Text>
              </Flex>
            </Stack>
            {/* LICENSES */}
            <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
              <Icon
                mt={1}
                h={'20px'}
                w={'20px'}
                color={secondaryTextInverse}
                as={FaBalanceScale}
              />
              <Flex flexDir={'column'} alignItems={'center'}>
                <Tag
                  cursor={'pointer'}
                  size='md'
                  variant='subtle'
                  width={16}
                  colorScheme={'blue'}
                  onClick={onSelectLicenses}
                >
                  <TagLabel mx={'auto'}>{compLicenseCount}</TagLabel>
                </Tag>
                <Text
                  cursor={'pointer'}
                  mt={1}
                  fontSize={'xs'}
                  _hover={{ textDecoration: 'underline' }}
                  onClick={onSelectLicenses}
                >
                  Licenses
                </Text>
              </Flex>
            </Stack>
            {/* VULNERABILITIES */}
            <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
              <Icon
                mt={1}
                h={4}
                w={4}
                color={secondaryTextInverse}
                as={FaBug}
              />
              <Flex flexDir={'column'} alignItems={'center'}>
                <SimpleGrid
                  gap={1}
                  w={'100%'}
                  columns={5}
                  fontWeight={'medium'}
                >
                  <VulnBadge
                    color='red'
                    label='Critical'
                    onClick={() => onFilterVuln(['critical'])}
                  >
                    {critical ? critical : 0}
                  </VulnBadge>
                  <VulnBadge
                    color='orange'
                    label='High'
                    onClick={() => onFilterVuln(['high'])}
                  >
                    {high ? high : 0}
                  </VulnBadge>
                  <VulnBadge
                    color='yellow'
                    label='Medium'
                    onClick={() => onFilterVuln(['medium'])}
                  >
                    {medium ? medium : 0}
                  </VulnBadge>
                  <VulnBadge
                    color='green'
                    label='Low'
                    onClick={() => onFilterVuln(['low'])}
                  >
                    {low ? low : 0}
                  </VulnBadge>
                  <VulnBadge
                    color='gray'
                    label='Unknown'
                    onClick={() => onFilterVuln(['unknown'])}
                  >
                    {unknown ? unknown : 0}
                  </VulnBadge>
                </SimpleGrid>
                <Text
                  mt={1}
                  fontSize={'xs'}
                  style={{ cursor: 'pointer' }}
                  _hover={{ textDecoration: 'underline' }}
                  onClick={onSelectVulns}
                >
                  Vulnerabilities
                </Text>
              </Flex>
            </Stack>
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}

export default SbomDetails
