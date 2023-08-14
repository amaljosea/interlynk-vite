// Chakra imports
import {
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import ProductVersionsRow from 'components/Tables/ProductVersionsRow.js'
import React from 'react'

const ProductVersions = ({ captions, productVersionsData, filterData }) => {
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <CardBody>
        <Table variant='simple' color={textColor} size='sm'>
          <Thead>
            <Tr my='.8rem'>
              {captions.map((caption, idx) => {
                return (
                  <Th color='gray.400' key={idx} pl={0}>
                    {caption}
                  </Th>
                )
              })}
            </Tr>
          </Thead>
          <Tbody>
            {filterData.length >= 1
              ? filterData.map((pv, index) => {
                  return (
                    <ProductVersionsRow
                      key={pv.name + pv.updated_at}
                      id={pv.id}
                      name={pv.name}
                      description={pv.description}
                      logo={pv.logo}
                      version={pv.version}
                      sbomlinks={pv.sbom_links}
                      risk_score={pv.risk_score}
                      updated_at={pv.updated_at}
                      active={pv.active}
                      vendor={pv.vendor}
                      quality_score={pv.quality_score}
                    />
                  )
                })
              : productVersionsData.map((pv, index) => {
                  return (
                    <ProductVersionsRow
                      key={pv.name + pv.updated_at}
                      id={Math.random() * 100}
                      name={pv.name}
                      description={pv.description}
                      logo={pv.logo}
                      version={pv.version}
                      sbomlinks={pv.sbom_links}
                      risk_score={pv.risk_score}
                      updated_at={pv.updated_at}
                      active={pv.active}
                      vendor={pv.vendor}
                      quality_score={pv.quality_score}
                    />
                  )
                })}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default ProductVersions

// filterData.length !== 0 &&
