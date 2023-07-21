// Chakra imports
import {
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Input
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMComponentRow from 'components/Tables/SBOMComponentRow.js'
import SBOMLinkRow from 'components/Tables/SBOMLinkRow.js'
import VulnerabilityRow from 'components/Tables/VulnerabilityRow.js'
import React, { useEffect } from 'react'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'
import { useTable, useSortBy } from 'react-table'

const SBOMTable = ({ title, captions, data, vulData }) => {
  const { SBOMLinksData } = useContext(GlobalContext)
  const textColor = useColorModeValue('gray.700', 'white')

  useEffect(() => {
    console.log('value', value)
  }, [value])

  const link_captions = [
    'Active',
    'Contains',
    'Shared With',
    'Visits',
    'Created',
    'Link',
    ''
  ]
  const vuln_captions = [
    'CVE',
    'CVSS',
    'Description',
    'component',
    'version',
    'Fixed (Component)',
    'Fixed (Product)',
    'Status',
    ''
  ]

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <Tabs>
        <TabList mt='20px'>
          <Tab>Share Lynks</Tab>
          <Tab>Components</Tab>
          <Tab>Vulnerabilities</Tab>
          <Tab>Risks</Tab>
          <Tab>View</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm'>
                <Thead>
                  <Tr my='.8rem' pl='0px'>
                    {link_captions.map((caption, idx) => {
                      return (
                        <Th
                          color='gray.400'
                          key={idx}
                          ps={idx === 0 ? '0px' : null}
                        >
                          {caption}
                        </Th>
                      )
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  {SBOMLinksData.map((row, idx) => {
                    return (
                      <SBOMLinkRow
                        key={'SBOMLinkRow' + idx}
                        id={'SBOMLinkRow' + idx}
                        link={row.link}
                        visits={row.visits}
                        created={row.created}
                        shared_with={row.shared_with}
                        conf_email={row.conf_email}
                        conf_terms={row.conf_terms}
                        redactions={row.redactions}
                        components={row.components}
                        licenses={row.licenses}
                        vulnerabilities={row.vulnerabilities}
                        cyclonedx={row.cyclonedx}
                        spdx={row.spdx}
                        active={row.active}
                      />
                    )
                  })}
                </Tbody>
              </Table>
            </CardBody>
          </TabPanel>
          <TabPanel>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm'>
                <Thead>
                  <Tr my='.8rem' pl='0px'>
                    {captions.map((caption, idx) => {
                      return (
                        <Th
                          color='gray.400'
                          key={idx}
                          ps={idx === 0 ? '0px' : null}
                        >
                          {caption}
                        </Th>
                      )
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  {data.map((row) => {
                    return (
                      <SBOMComponentRow
                        key={row.component + row.version}
                        component={row.component}
                        logo={row.logo}
                        version={row.version}
                        dependsOn={row.dependsOn}
                        license={row.license}
                        risk_score={row.risk_score}
                        critical={row.critical}
                        high={row.high}
                        medium={row.medium}
                        low={row.low}
                        updated={row.updated}
                        redacted={row.redacted}
                      />
                    )
                  })}
                </Tbody>
              </Table>
            </CardBody>
          </TabPanel>
          <TabPanel>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm' overflowX={'auto'}>
                <Thead>
                  <Tr my='.8rem' pl='0px'>
                    {vuln_captions.map((caption, idx) => {
                      return (
                        <Th
                          color='gray.400'
                          key={idx}
                          ps={idx === 0 ? '0px' : null}
                        >
                          {caption}
                        </Th>
                      )
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  {vulData.map((row, idx) => {
                    return (
                      <VulnerabilityRow
                        key={idx}
                        component={row.component}
                        version={row.version}
                        cvss={row.cvss}
                        cve={row.cve}
                        fixed_component={row.fixed_component}
                        fixed_product={row.fixed_product}
                        description={row.description}
                        status={row.status}
                      />
                    )
                  })}
                </Tbody>
              </Table>
            </CardBody>
          </TabPanel>
          <TabPanel>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm'>
                <Thead>
                  <Tr my='.8rem' pl='0px'>
                    {vuln_captions.map((caption, idx) => {
                      return (
                        <Th
                          color='gray.400'
                          key={idx}
                          ps={idx === 0 ? '0px' : null}
                        >
                          {caption}
                        </Th>
                      )
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  {vulData.map((row, idx) => {
                    return (
                      <VulnerabilityRow
                        key={idx}
                        component={row.component}
                        version={row.version}
                        cvss={row.cvss}
                        cve={row.cve}
                        fixed_component={row.fixed_component}
                        fixed_product={row.fixed_product}
                        description={row.description}
                        status={row.status}
                      />
                    )
                  })}
                </Tbody>
              </Table>
            </CardBody>
          </TabPanel>
          <TabPanel>
            <CardBody>
              <Textarea
                value={value}
                onChange={handleInputChange}
                placeholder='Here is a sample placeholder'
                size='xl'
              />
            </CardBody>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default SBOMTable
