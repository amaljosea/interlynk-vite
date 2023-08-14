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
  Input,
  Td,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMComponentRow from 'components/Tables/SBOMComponentRow.js'
import React, { useRef, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import ShareLynkRow from 'components/Tables/ShareLynkRow'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'

const SBOMTable = ({ title, captions, data, vulData }) => {
  const { SBOMLinksData } = useContext(GlobalContext)
  const textColor = useColorModeValue('gray.700', 'white')

  const location = useLocation()

  const link_captions = ['Active', 'Contains', 'Visits', 'Created', 'Link', '']

  const { isOpen, onOpen, onClose } = useDisclosure()

  const btnRef = useRef(null)

  const [generalData, setGeneralData] = useState({
    createdAt: '05-08-2023',
    lastUpdatedAt: '12-08-2023',
    authors: 'Surendra Pathak',
    orgs: 'interlynk.io',
    emails: ['sp@interlynk.io'],
    supplierName: 'Interlynk Inc',
    product: 'SBOM-Tool v1.0',
    license: 'MIT',
    cpe: 'CPEXYZ123',
    purl: 'PURLABCDEF',
    swid: '',
    md5: 'ABCDEFGHI',
    sha: '23434354443'
  })

  const [selectedKey, setSelectedKey] = useState('')

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <Tabs variant='enclosed'>
        <TabList mt='20px'>
          {!location.pathname.startsWith('/sharelynk') && (
            <Tab>Share Lynks</Tab>
          )}
          <Tab>General</Tab>
          <Tab>Components</Tab>
        </TabList>
        <TabPanels>
          {/* share lynks */}
          {!location.pathname.startsWith('/sharelynk') && (
            <TabPanel>
              <CardBody>
                <Table variant='simple' color={textColor} size='sm'>
                  <Thead>
                    <Tr my='7rem' pl='0px'>
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
                        <ShareLynkRow
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
          )}
          {/* general */}
          <TabPanel>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm'>
                <Thead>
                  <Tr>
                    <Th></Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <GeneralDataRow
                    onOpen={onOpen}
                    data={generalData}
                    setSelectedKey={setSelectedKey}
                  />
                </Tbody>
              </Table>
              <GeneralDataDrawer
                isOpen={isOpen}
                onClose={onClose}
                btnRef={btnRef}
                data={generalData}
                setGeneralData={setGeneralData}
                selectedKey={selectedKey}
              />
            </CardBody>
          </TabPanel>
          {/* component */}
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
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default SBOMTable
