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
  } from "@chakra-ui/react";
  // Custom components
  import Card from "components/Card/Card.js";
  import CardBody from "components/Card/CardBody.js";
  import CardHeader from "components/Card/CardHeader.js";
  import ProductVersionsRow from "components/Tables/ProductVersionsRow.js";
  import React from "react";

  const ProductVersions = ({ title, captions, productVersionsData }) => {
    const textColor = useColorModeValue("gray.700", "white");
    const productVersionExploded = [];
    productVersionsData.map(p => {
      p.versions.map(v => {
        productVersionExploded.push(
          {
              name: p.name,
              description: p.description,
              logo: p.logo,
              version: v.version,
              sbom_links: v.sbom_links,
              risk_score: v.risk_score,
              updated_at: v.updated_at,
              active: v.active
          }
        );
      }
    )});
    productVersionExploded.sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1));

    return (
      <Card my='22px' overflowX={{ sm: "scroll", xl: "hidden" }}>
        <CardBody>
          <Table variant='simple' color={textColor} size='sm'>
            <Thead>
              <Tr my='.8rem' pl='0px'>
                {captions.map((caption, idx) => {
                  return (
                    <Th color='gray.400' key={idx} ps={idx === 0 ? "0px" : null}>
                      {caption}
                    </Th>
                  );
                })}
              </Tr>
            </Thead>
            <Tbody>
              {
                productVersionExploded.map((pv => {
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
                    />
                )}))
              }
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    );
  };

  export default ProductVersions;
