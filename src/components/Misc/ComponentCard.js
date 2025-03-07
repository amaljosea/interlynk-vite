import { gql, useQuery } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { EditIcon } from '@chakra-ui/icons'
import {
  Divider,
  Flex,
  IconButton,
  SimpleGrid,
  Stack,
  Text
} from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { BiLayer } from 'react-icons/bi'
import { FaCube } from 'react-icons/fa6'
import { PiTreeStructure } from 'react-icons/pi'

export const GetComponentData = gql`
  query GetComponentData($projectId: Uuid!, $sbomId: Uuid!, $search: String) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      components(sbomId: $sbomId, search: $search) {
        nodes {
          id
          name
          kind
          purl
          cpes
          version
          primary
          internal
          licensesExp
        }
      }
    }
  }
`

const ComponentCard = ({ value, isOpen, onClose }) => {
  const params = useParams()
  const navigate = useNavigate()
  const { dispatch } = useGlobalState()

  const { prodCompDispatch } = dispatch

  const isChnagelog = typeof value === 'string'
  const componentName = isChnagelog ? value?.split(' ')[0] : value?.name

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const link = generateProductVersionDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: 'components'
    }
  })

  const { primaryBlueText, sameSecondaryText, infoTextColor } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText',
    'infoTextColor'
  ])

  const [pkg, setPkg] = useState(null)

  const { data, loading } = useQuery(GetComponentData, {
    skip: isOpen ? false : true,
    variables: {
      sbomId: params.sbomid,
      projectId: params.productid,
      search: componentName
    }
  })

  const { nodes } = data?.sbom?.components || ''
  const { name, version, kind, purl, licensesExp, primary, internal } =
    nodes?.length > 0 ? nodes[0] : ''

  const label = { fontSize: 12, color: sameSecondaryText }
  const infoStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: infoTextColor
  }
  const buttonStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: primaryBlueText,
    variant: 'outline'
  }

  const onCheck = () => {
    prodCompDispatch({
      type: 'CHANGE_SEARCH_INPUT',
      payload: componentName || ''
    })
    prodCompDispatch({
      type: 'SET_EXPAND',
      payload: componentName || ''
    })
    navigate(link)
  }

  const onCheckTree = () => {
    if (nodes?.length > 0) {
      prodCompDispatch({
        type: 'CHANGE_SEARCH_INPUT',
        payload: componentName || ''
      })
      prodCompDispatch({ type: 'SET_COMPONENT', payload: nodes[0] })
      navigate(link)
    }
  }

  useEffect(() => {
    if (purl) {
      try {
        const result = PackageURL.fromString(purl)
        setPkg(result)
      } catch (ex) {
        console.warn('ex', ex)
      }
    }
  }, [purl])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title='Component Details'
      Icon={BiLayer}
      noFooter={true}
      maxW={'600px'}
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack spacing={6}>
          <Flex alignItems={'center'} gap={3}>
            <IconButton size='sm' colorScheme='blue' icon={<FaCube />} />
            <Text fontSize={17} color={primaryBlueText} fontWeight={600}>
              {name}
            </Text>
          </Flex>
          <SimpleGrid columns={3} gap={5}>
            <Stack spacing={1}>
              <Text {...label}>Ecosystem</Text>
              <Text {...infoStyle}>{pkg?.type || 'N/A'}</Text>
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
                onClick={onCheckTree}
                leftIcon={<PiTreeStructure fontSize={16} />}
              >
                Component Hierachy
              </Button>
              <Button
                {...buttonStyle}
                onClick={onCheck}
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
