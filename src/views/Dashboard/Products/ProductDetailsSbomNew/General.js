import { getFullDate } from 'utils'
import { isSbomArchived } from 'utils'
import { infoData } from 'variables/general'

import { Flex, Skeleton, Stack, Text } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import InfoLabel from 'components/Misc/InfoLabel'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import Authors from './SbomDetails/Authors'
import License from './SbomDetails/License'
import Phases from './SbomDetails/Phases'
import Supplier from './SbomDetails/Supplier'
import Tools from './SbomDetails/Tools'

const General = ({ data, loading, error }) => {
  const { grayBorderColor } = useThemeColor(['grayBorderColor'])

  const isArchived = isSbomArchived(data)

  const editSboms = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  const licenseData = {
    id: data?.id,
    spec: data?.spec,
    license: data?.licensesExp
  }

  const container = {
    pb: 3,
    gap: 5,
    w: '100%',
    fontSize: 'sm',
    alignItems: 'center',
    templateColumns: `repeat(12, 1fr)`,
    borderBottom: `1px solid ${grayBorderColor}`
  }

  const sbomData = [
    {
      label: 'Created At',
      value: <Text>{getFullDate(data?.creationAt)}</Text>
    },
    {
      label: 'Phases',
      value: <Phases data={data?.phases || []} permission={isArchived} />
    },
    {
      label: 'Creation Tool',
      value: (
        <Tools data={data?.tools || []} permission={isArchived || !editSboms} />
      )
    },
    {
      label: 'Authors',
      value: (
        <Authors
          data={data?.authors || []}
          permission={isArchived || !editSboms}
        />
      )
    },
    {
      label: 'Supplier',
      value: (
        <Supplier
          data={data?.suppliers || []}
          permission={isArchived || !editSboms}
        />
      )
    },
    {
      label: 'Data License',
      value: (
        <License data={licenseData} permission={isArchived || !editSboms} />
      )
    }
  ]

  if (loading) {
    return (
      <Flex mt={4} width={'100%'} flexDir={'column'} gap={4}>
        {[1, 2].map((_, index) => (
          <Skeleton key={index} width={'100%'} height='20px' />
        ))}
      </Flex>
    )
  }

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <CardBody>
      <Stack w={'100%'} spacing={3} mt={2}>
        {sbomData?.map((item, index) => (
          <Grid key={index} {...container}>
            <GridItem colSpan={3}>
              <InfoLabel title={item?.label} onCheck={onCheck(item?.label)} />
            </GridItem>
            <GridItem colSpan={9}>{item?.value}</GridItem>
          </Grid>
        ))}
      </Stack>
    </CardBody>
  )
}

export default General
