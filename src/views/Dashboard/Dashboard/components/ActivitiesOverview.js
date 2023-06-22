// Chakra imports
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import ActivitiesOverviewRow from "components/Tables/ActivitiesOverviewRow";
import React from "react";

const ActivitiesOverview = ({ title, amount, data }) => {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Card maxH='100%'>
      <CardHeader p='12px 0px 40px 0px'>
        <Flex direction='column'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' pb='.5rem'>
            {title}
          </Text>
        </Flex>
      </CardHeader>
      <CardBody ps='20px' pe='0px' mb='31px' position='relative'>
        <Flex direction='column'>
          {data.map((row, index, arr) => {
            return (
              <ActivitiesOverviewRow
                key={row.title}
                logo={row.logo}
                title={row.title}
                date={row.date}
                color={row.color}
                index={index}
                arrLength={arr.length}
              />
            );
          })}
        </Flex>
      </CardBody>
    </Card>
  );
};

export default ActivitiesOverview;
