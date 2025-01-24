import { getFullDate } from 'utils'
import { infoData } from 'variables/general'

import { Flex, Skeleton, Text } from '@chakra-ui/react'
import { Table, Tbody, Td, Tr } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import InfoLabel from 'components/Misc/InfoLabel'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import Authors from './SbomDetails/Authors'
import License from './SbomDetails/License'
import Lifecycle from './SbomDetails/Lifecycle'
import Phases from './SbomDetails/Phases'
import Supplier from './SbomDetails/Supplier'
import Tools from './SbomDetails/Tools'

const General = ({ data, loading, error }) => {
  const { inverseSecondaryBgColor, grayBorderColor } = useThemeColor([
    'inverseSecondaryBgColor',
    'sameSecondaryText',
    'grayBorderColor'
  ])

  const isArchived = data?.lifecycle === 'archived'

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

  const lifecycleData = {
    stage: data?.productLifeCycleStage,
    releaseDate: data?.releaseDate,
    endOfLifeDate: data?.endOfLifeDate,
    endOfSupportDate: data?.endOfSupportDate
  }

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
    <>
      <CardBody>
        <Table
          __css={{ tableLayout: 'fixed', width: 'full' }}
          variant='simple'
          color={inverseSecondaryBgColor}
        >
          <Tbody w={'100%'}>
            {/* CREATED AT */}
            <Tr minH={'64px'}>
              <Td
                pl={0}
                w={'15%'}
                fontSize={'sm'}
                fontWeight={'medium'}
                borderColor={grayBorderColor}
              >
                <InfoLabel
                  title={`Created At`}
                  onCheck={onCheck('Created At')}
                />
              </Td>
              <Td
                py={0}
                w={'85%'}
                fontSize={'sm'}
                borderColor={grayBorderColor}
              >
                {data?.creationAt ? getFullDate(data?.creationAt) : ''}
              </Td>
            </Tr>
            {/* PHASES */}
            <Tr minH={'64px'}>
              <Td
                pl={0}
                w={'15%'}
                fontSize={'sm'}
                fontWeight={'medium'}
                borderColor={grayBorderColor}
              >
                <InfoLabel title={`Phases`} onCheck={onCheck('SBOM Phases')} />
              </Td>
              <Td w={'85%'} py={0} borderColor={grayBorderColor}>
                <Phases data={data?.phases || []} permission={isArchived} />
              </Td>
            </Tr>
            {/* LIFECYCLE STAGE */}
            <Tr minH={'64px'}>
              <Td
                pl={0}
                w={'15%'}
                fontSize={'sm'}
                fontWeight={'medium'}
                borderColor={grayBorderColor}
              >
                <InfoLabel
                  title={`Lifecycle Stage`}
                  onCheck={onCheck('SBOM Phases')}
                />
              </Td>
              <Td w={'85%'} py={0} borderColor={grayBorderColor}>
                <Lifecycle
                  data={lifecycleData || null}
                  permission={isArchived}
                />
              </Td>
            </Tr>
            {/* CREATION TOOLS */}
            <Tr minH={'64px'}>
              <Td
                pl={0}
                w={'15%'}
                fontSize={'sm'}
                fontWeight={'medium'}
                borderColor={grayBorderColor}
              >
                <InfoLabel
                  title={`Creation Tool`}
                  onCheck={onCheck('Creation Tool')}
                />
              </Td>
              <Td w={'85%'} py={0} borderColor={grayBorderColor}>
                <Tools
                  data={data?.tools || []}
                  permission={isArchived || !editSboms}
                />
              </Td>
            </Tr>
            {/* AUTHORS */}
            <Tr minH={'64px'}>
              <Td
                pl={0}
                w={'15%'}
                fontSize={'sm'}
                fontWeight={'medium'}
                borderColor={grayBorderColor}
              >
                <InfoLabel title={`Authors`} onCheck={onCheck('Authors')} />
              </Td>
              <Td w={'85%'} py={0} borderColor={grayBorderColor}>
                <Authors
                  data={data?.authors || []}
                  permission={isArchived || !editSboms}
                />
              </Td>
            </Tr>
            {/* SUPPLIERS */}
            <Tr minH={'64px'}>
              <Td
                pl={0}
                w={'15%'}
                fontSize={'sm'}
                fontWeight={'medium'}
                borderColor={grayBorderColor}
              >
                <InfoLabel title={`Supplier`} onCheck={onCheck('Supplier')} />
              </Td>
              <Td w={'85%'} py={0} borderColor={grayBorderColor}>
                <Supplier
                  data={data?.suppliers || []}
                  permission={isArchived || !editSboms}
                />
              </Td>
            </Tr>
            {/* LICENSES */}
            <Tr minH={'64px'}>
              <Td
                pl={0}
                w={'15%'}
                fontSize={'sm'}
                fontWeight={'medium'}
                borderColor={grayBorderColor}
              >
                Data License
              </Td>
              <Td w={'85%'} py={0} borderColor={grayBorderColor}>
                <License
                  data={licenseData}
                  permission={isArchived || !editSboms}
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </CardBody>
    </>
  )
}

export default General
