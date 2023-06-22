// Chakra imports
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  MenuList,
  MenuItem,
  Menu,
  MenuButton,
  Button
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import CardHeader from 'components/Card/CardHeader.js'
import ProductVersionsRow from 'components/Tables/ProductVersionsRow.js'
import GlobalContext from 'context/GlobalContext'
import React from 'react'
import { useContext } from 'react'

const ProductVersions = ({
  title,
  captions,
  productVersionsData,
  filterData,
  groupVersionData
}) => {
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <CardBody>
        <Table variant='simple' color={textColor} size='sm'>
          <Thead>
            <Tr my='.8rem' pl='0px'>
              {groupVersionData.length > 0 ? (
                <>
                  <Th color='gray.400'>Active</Th>
                  <Th color='gray.400'>Product</Th>
                  <Th color='gray.400'>Vendor</Th>
                  <Th color='gray.400'>Quality Score</Th>
                  <Th color='gray.400'>Version Count</Th>
                  <Th color='gray.400'>SBOM Links</Th>
                  <Th color='gray.400'>Latest Risk Score</Th>
                  <Th color='gray.400'>Last Updated</Th>
                  <Th color='gray.400'></Th>
                </>
              ) : (
                captions.map((caption, idx) => {
                  return (
                    <Th
                      color='gray.400'
                      key={idx}
                      ps={idx === 0 ? '0px' : null}
                    >
                      {caption}
                    </Th>
                  )
                })
              )}
            </Tr>
          </Thead>
          <Tbody>
            {groupVersionData.length > 0
              ? groupVersionData.map((item, index) => (
                  <ProductVersionsRow
                    key={index}
                    name={item.name}
                    description={item.description}
                    logo={item.logo}
                    version={
                      item.versions.length > 0 ? item.versions.length : 0
                    }
                    sbomlinks={
                      item.versions.length > 0 ? item.versions.length : 0
                    }
                    risk_score={
                      item.versions.length > 0
                        ? item.versions.length
                        : item.risk_score
                    }
                    updated_at={item.updated_at}
                    active={item.active}
                    vendor={item.vendor}
                    quality_score={item.quality_score}
                  />
                ))
              : filterData.length >= 1
              ? filterData.map((pv) => {
                  return (
                    <ProductVersionsRow
                      key={pv.name + pv.updated_at}
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
              : productVersionsData.map((pv) => {
                  return (
                    <ProductVersionsRow
                      key={pv.name + pv.updated_at}
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
