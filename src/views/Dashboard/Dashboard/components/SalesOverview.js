// Chakra imports
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import React from "react";

const RiskScoreOverview = ({ title, percentage, chart }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const iconBoxInside = useColorModeValue("white", "white");
  return (
    <Card p='28px 10px 16px 0px' mb={{ sm: "26px", lg: "0px" }}>
      <CardHeader mb='20px' pl='22px'>
        <Flex direction='column' alignSelf='flex-start'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' mb='6px'>
            {title}
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
      <Box w='100%' h={{ sm: "300px" }} ps='8px'>
        {chart}
      </Box>
      </CardBody>
    </Card>
  );
};

export default RiskScoreOverview;
