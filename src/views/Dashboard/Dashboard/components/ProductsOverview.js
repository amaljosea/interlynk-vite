// Chakra imports
import {
  Flex,
  Icon,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import ProductsOverviewTableRow from "components/Tables/ProductsOverviewTableRow";
import React from "react";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

const ProductsOverview = ({ title, amount, captions, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  data.sort((a, b) => {
    const sumA = a.versions.reduce((sum, version) => sum + version.sbom_links, 0);
    const sumB = b.versions.reduce((sum, version) => sum + version.sbom_links, 0);
    return sumB - sumA; // Sort in descending order
  });
  return (
    <Card p='16px' overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='12px 0px 28px 0px'>
        <Flex direction='column'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' pb='.5rem'>
            {title}
          </Text>
        </Flex>
      </CardHeader>
      <Table variant='simple' color={textColor}>
        <Thead>
          <Tr my='.8rem' ps='0px'>
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
          {data.map((row) => {
            return (
              <ProductsOverviewTableRow
                name={row.name}
                project={row.project}
                description={row.description}
                logo={row.logo}
                versions={row.versions}
                sbom_links={row.versions.reduce((sum, version) => sum + version.sbom_links, 0)}
                risk_score={row.risk_score}
              />
            );
          })}
        </Tbody>
      </Table>
    </Card>
  );
};

export default ProductsOverview;
