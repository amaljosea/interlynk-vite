import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'
import VulnBadge from 'components/Misc/VulnBadge'
import { useGlobalState } from 'hooks/useGlobalState'
import {
  FaAngleLeft,
  FaBalanceScale,
  FaBug,
  FaCube,
  FaCubes
} from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import { timeSince, getFullDateAndTime } from 'utils'

const SbomDetails = ({ sbom, getCompData, getVulnData }) => {
  const {
    project,
    primaryComponent,
    updatedAt,
    lifecycle,
    vulnRunStatus,
    stats
  } = sbom
  const { compCount, compLicenseCount, vulnStats } = stats
  const { critical, high, medium, low } = vulnStats

  const {
    totalRows,
    prodCompState,
    prodVulnState,
    setActiveSbomTab,
    dispatch
  } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const parts = queryParams.get('parts')

  const currentProduct = JSON.parse(localStorage.getItem(`product`))
  const { name, id } = currentProduct
  const currentSBOM = JSON.parse(localStorage.getItem(`currentSBOM`))

  const onSelectComp = () => {
    const { field, direction } = prodCompState
    getCompData({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        field: field,
        direction: direction
      }
    }).then((res) => {
      if (res.data) {
        setActiveSbomTab(2)
        prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      }
    })
  }

  const onFilterVuln = (value) => {
    const { field, direction } = prodVulnState
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    getVulnData({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        severity: value || undefined,
        first: totalRows,
        field: field,
        direction: direction
      }
    }).then((res) => {
      if (res.data) {
        setActiveSbomTab(3)
        prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value || [] })
      }
    })
  }

  return (
    <Flex direction={'row'} alignItems={'flex-start'} gap={5} width={'100%'}>
      <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
      <Flex direction={'column'} gap={0.5}>
        {/* PRODUCT TITLE */}
        <Stack direction={'column'} spacing={1} alignItems={'left'}>
          {currentProduct && parts && currentSBOM && (
            <Link
              to={`/vendor/products/${name}?&id=${id}&sbom=${currentSBOM.id}`}
            >
              <HStack
                onClick={() => {
                  localStorage.setItem('activeSbomTab', 1)
                  setActiveSbomTab(1)
                }}
              >
                <FaAngleLeft size={18} color='#3182CE' />
                <Text
                  fontWeight={'semibold'}
                  fontSize={18}
                  color={'blue.500'}
                  textDecor={'underline'}
                >
                  {name} : {currentSBOM.version}
                </Text>
              </HStack>
            </Link>
          )}
          <Text fontWeight={'semibold'} fontSize={25}>
            {project?.name} : {primaryComponent?.version}
          </Text>
        </Stack>
        <Text fontSize={'sm'} my={0.5}>
          {primaryComponent?.description}
        </Text>
        <Tooltip placement='top' label={getFullDateAndTime(updatedAt)}>
          <Text fontSize='xs' cursor={'pointer'}>
            Updated {timeSince(updatedAt)}
          </Text>
        </Tooltip>
        <HStack mt={1} spacing={2} alignItems={'center'}>
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
          {vulnRunStatus === 'IN_PROGRESS' && (
            <Tooltip label='Vulnerability scan in progress' fontSize='md'>
              <Tag
                w={'fit-content'}
                size={'sm'}
                variant='solid'
                colorScheme='blue'
              >
                <TagLabel textTransform={'capitalize'}>Scanning</TagLabel>
              </Tag>
            </Tooltip>
          )}
        </HStack>
        {/* STATS */}
        <Flex flexDir={'row'} alignItems={'center'} gap={4} mt={5}>
          {/* COMPONENTS */}
          <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
            <Icon h={4} w={4} mt={1} color='#777' as={FaCube} />
            <Box>
              <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
                <TagLabel mx={'auto'}>{compCount}</TagLabel>
              </Tag>
              <Text
                mt={1}
                fontSize={'xs'}
                onClick={onSelectComp}
                cursor={'pointer'}
                _hover={{ textDecoration: 'underline' }}
              >
                Components
              </Text>
            </Box>
          </Stack>
          {/* LICENSES */}
          <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
            <Icon
              mt={1}
              h={'20px'}
              w={'20px'}
              color='#777'
              as={FaBalanceScale}
            />
            <Box>
              <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
                <TagLabel mx={'auto'}>{compLicenseCount}</TagLabel>
              </Tag>
              <Text mt={1} fontSize={'xs'}>
                Licenses
              </Text>
            </Box>
          </Stack>
          {/* VULNERABILITIES */}
          <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
            <Icon mt={1} h={4} w={4} color='#777' as={FaBug} />
            <Box>
              <Stack fontWeight={'medium'} direction={'row'}>
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
              </Stack>
              <Text
                fontSize={'xs'}
                mt={1}
                onClick={() => onFilterVuln(null)}
                style={{ cursor: 'pointer' }}
                _hover={{ textDecoration: 'underline' }}
              >
                Vulnerabilities
              </Text>
            </Box>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default SbomDetails
