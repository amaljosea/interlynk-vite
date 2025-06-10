import { gql, useQuery } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { EditIcon } from '@chakra-ui/icons'
import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  IconButton,
  SimpleGrid,
  Stack,
  Text
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuComponent, LuLayers } from 'react-icons/lu'
import { PiTreeStructure } from 'react-icons/pi'

const GetComponentData = gql`
  query GetComponentData($projectId: Uuid!, $sbomId: Uuid!, $search: String) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      components(sbomId: $sbomId, search: $search) {
        nodes {
          id
          name
          kind
          purl
          version
          primary
          internal
          licensesExp
        }
      }
    }
  }
`

const ComponentCard = ({ value: componentData, isOpen, onClose }) => {
  const params = useParams()
  const navigate = useNavigate()
  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const isChangelogView = typeof componentData === 'string'
  const componentName = isChangelogView
    ? componentData?.split(' ')[0]
    : componentData?.name

  const linkToComponentTab = generateProductVersionDetailPageUrlFromCurrentUrl({
    paramsObj: { tab: 'components' }
  })

  const { primaryBlueText, sameSecondaryText, infoTextColor } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText',
    'infoTextColor'
  ])

  const { data, loading } = useQuery(GetComponentData, {
    skip: !isOpen,
    variables: {
      sbomId: params.sbomid,
      projectId: params.productid,
      search: componentName
    }
  })

  const component = data?.sbom?.components?.nodes?.[0] || {}
  const {
    name = 'N/A',
    version = 'N/A',
    kind = 'N/A',
    purl,
    licensesExp = 'N/A',
    primary,
    internal
  } = component

  const parsedPurl = useMemo(() => {
    if (!purl) return null
    try {
      return PackageURL.fromString(purl)
    } catch (err) {
      console.warn('Invalid PURL:', err)
      return null
    }
  }, [purl])

  const label = { fontSize: 12, color: sameSecondaryText }
  const infoStyle = {
    fontSize: 14,
    lineHeight: 5,
    fontWeight: 600,
    color: infoTextColor
  }
  const buttonStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: primaryBlueText,
    variant: 'outline'
  }

  const handleEditComponent = () => {
    prodCompDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: componentName })
    prodCompDispatch({ type: 'SET_EXPAND', payload: componentName })
    navigate(linkToComponentTab)
  }

  const handleViewHierarchy = () => {
    if (component?.id) {
      prodCompDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: componentName })
      prodCompDispatch({ type: 'SET_COMPONENT', payload: component })
      navigate(linkToComponentTab)
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title='Component Details'
      Icon={LuLayers}
      noFooter
      maxW={'600px'}
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack spacing={6}>
          <Flex alignItems={'center'} gap={3}>
            <IconButton
              size='sm'
              colorScheme='blue'
              icon={<LuComponent size={20} />}
            />
            <Text
              fontSize={17}
              lineHeight={'5'}
              fontWeight={600}
              wordBreak={'break-all'}
              color={primaryBlueText}
            >
              {name}
            </Text>
          </Flex>

          <SimpleGrid columns={3} gap={5}>
            <Stack spacing={1}>
              <Text {...label}>Ecosystem</Text>
              <Text {...infoStyle}>{parsedPurl?.type || 'N/A'}</Text>
            </Stack>
            <Stack spacing={1}>
              <Text {...label}>Version</Text>
              <Text {...infoStyle}>{version || 'N/A'}</Text>
            </Stack>
            <Stack spacing={1}>
              <Text {...label}>Type</Text>
              <Text {...infoStyle}>{kind || 'N/A'}</Text>
            </Stack>
            <Stack spacing={1}>
              <Text {...label}>License</Text>
              <Text {...infoStyle}>{licensesExp || 'N/A'}</Text>
            </Stack>
            <Stack spacing={1}>
              <Text {...label}>Primary</Text>
              <Text {...infoStyle}>{primary ? 'Yes' : 'No'}</Text>
            </Stack>
            <Stack spacing={1}>
              <Text {...label}>Internal</Text>
              <Text {...infoStyle}>{internal ? 'Yes' : 'No'}</Text>
            </Stack>
          </SimpleGrid>

          <Stack spacing={4}>
            <Divider />
            <ButtonGroup>
              <Button
                {...buttonStyle}
                onClick={handleViewHierarchy}
                leftIcon={<PiTreeStructure fontSize={16} />}
              >
                Component Hierarchy
              </Button>
              <Button
                {...buttonStyle}
                onClick={handleEditComponent}
                leftIcon={<EditIcon fontSize={16} />}
              >
                Edit Component
              </Button>
            </ButtonGroup>
          </Stack>
        </Stack>
      )}
    </LynkModal>
  )
}

export default ComponentCard
