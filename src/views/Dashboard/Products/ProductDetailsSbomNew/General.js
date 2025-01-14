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
import Phases from './SbomDetails/Phases'
import Supplier from './SbomDetails/Supplier'
import Tools from './SbomDetails/Tools'

const General = ({ data, loading, error }) => {
  const { inverseSecondaryBgColor, sameSecondaryText, neutralBorder } =
    useThemeColor([
      'inverseSecondaryBgColor',
      'sameSecondaryText',
      'neutralBorder'
    ])

  const LynkTd = ({ children, ...props }) => (
    <Td {...props} borderColor={neutralBorder}>
      {children}
    </Td>
  )

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
              <LynkTd p={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel
                  title={`Created At`}
                  onCheck={onCheck('Created At')}
                />
              </LynkTd>
              <LynkTd fontSize={'sm'} color={sameSecondaryText} width={'85%'}>
                {data?.creationAt ? getFullDate(data?.creationAt) : ''}
              </LynkTd>
            </Tr>
            {/* PHASES */}
            <Tr minH={'64px'}>
              <LynkTd p={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel title={`Phases`} onCheck={onCheck('SBOM Phases')} />
              </LynkTd>
              <LynkTd width={'85%'}>
                <Phases data={data?.phases || []} permission={isArchived} />
              </LynkTd>
            </Tr>
            {/* CREATION TOOLS */}
            <Tr minH={'64px'}>
              <LynkTd pl={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel
                  title={`Creation Tool`}
                  onCheck={onCheck('Creation Tool')}
                />
              </LynkTd>
              <LynkTd width={'85%'}>
                <Tools
                  data={data?.tools || []}
                  permission={isArchived || !editSboms}
                />
              </LynkTd>
            </Tr>
            {/* AUTHORS */}
            <Tr minH={'64px'}>
              <LynkTd p={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel title={`Authors`} onCheck={onCheck('Authors')} />
              </LynkTd>
              <LynkTd width={'85%'}>
                <Authors
                  data={data?.authors || []}
                  permission={isArchived || !editSboms}
                />
              </LynkTd>
            </Tr>
            {/* SUPPLIERS */}
            <Tr minH={'64px'}>
              <LynkTd pl={0} fontWeight={'medium'} w={'15%'}>
                <InfoLabel title={`Supplier`} onCheck={onCheck('Supplier')} />
              </LynkTd>
              <LynkTd w={'85%'} py={0}>
                <Supplier
                  data={data?.suppliers || []}
                  permission={isArchived || !editSboms}
                />
              </LynkTd>
            </Tr>
            {/* LICENSES */}
            <Tr minH={'64px'}>
              <LynkTd pl={0} fontSize={'sm'} fontWeight={'medium'} w={'15%'}>
                Data License
              </LynkTd>
              <LynkTd w={'85%'} py={0}>
                <License
                  data={licenseData}
                  permission={isArchived || !editSboms}
                />
              </LynkTd>
            </Tr>
          </Tbody>
        </Table>
      </CardBody>
    </>
  )
}

export default General
