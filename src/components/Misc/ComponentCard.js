import { gql, useQuery } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Divider, Grid, GridItem, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { BiLayer } from 'react-icons/bi'

import CustomTag from './CustomTag'

export const GetComponentData = gql`
  query GetComponentData($projectId: Uuid!, $sbomId: Uuid!, $search: String) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(sbomId: $sbomId, search: $search) {
        nodes {
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

const ListItem = ({ label, value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  return (
    <Grid alignItems={'center'} templateColumns='repeat(3, 1fr)'>
      <GridItem colSpan={1}>
        <Text color={primaryTextColor} fontSize={'sm'}>
          {label}
        </Text>
      </GridItem>
      <GridItem colSpan={2} textAlign={'right'}>
        <CustomTag>{value || '-'}</CustomTag>
      </GridItem>
    </Grid>
  )
}

const ComponentCard = ({ value, isOpen, onClose }) => {
  const params = useParams()
  const isChnagelog = typeof value === 'string'

  const [pkg, setPkg] = useState(null)

  const { data, loading } = useQuery(GetComponentData, {
    skip: isOpen ? false : true,
    variables: {
      sbomId: params.sbomid,
      projectId: params.productid,
      search: isChnagelog ? value?.split(' ')[0] : value?.name
    }
  })

  const { nodes } = data?.sbom?.components || ''
  const { name, version, kind, purl, licensesExp, primary, internal } =
    nodes?.length > 0 ? nodes[0] : ''

  useEffect(() => {
    if (purl) {
      try {
        PackageURL.fromString(purl)
        setPkg(true)
      } catch (ex) {
        console.error('ex', ex)
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
      maxW={'500px'}
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack spacing={2} py={3}>
          <ListItem label={'Ecosystem'} value={pkg?.type} />
          <Divider />
          <ListItem label={'Name'} value={name} />
          <Divider />
          <ListItem label={'Version'} value={version} />
          <Divider />
          <ListItem label={'Type'} value={kind} />
          <Divider />
          <ListItem label={'License'} value={licensesExp} />
          <Divider />
          <ListItem label={'Primary'} value={primary ? 'Yes' : 'No'} />
          <Divider />
          <ListItem label={'Internal'} value={internal ? 'Yes' : 'No'} />
        </Stack>
      )}
    </LynkModal>
  )
}

export default ComponentCard
