// Chakra imports
import {
  Flex,
  Grid,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";

import BarChart from "components/Charts/BarChart";
import LineChart from "components/Charts/LineChart";

import {
  FaWindowMaximize,
  FaCode,
  FaCodeBranch,
  FaLink
} from "react-icons/fa";

import React from "react";
import { dashboardTableData as productsOverviewData, activitiesData as activitiesOverviewData } from "variables/general";
import SBOMActivities from "./components/ActiveUsers";
import MiniStatistics from "./components/MiniStatistics";
import ActivitiesOverview from "./components/ActivitiesOverview";
import ProductsOverview from "./components/ProductsOverview";
import RiskScoreOverview from "./components/SalesOverview";

export default function Dashboard() {
  const iconBoxInside = useColorModeValue("white", "white");

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
        <MiniStatistics
          title={"Products"}
          amount={"12"}
          percentage={9}
          icon={<FaWindowMaximize h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Repositories"}
          amount={"21"}
          percentage={10}
          icon={<FaCode h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Versions"}
          amount={"113"}
          percentage={8}
          icon={<FaCodeBranch h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"SBOM Links"}
          amount={"72"}
          percentage={16}
          icon={<FaLink h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
      </SimpleGrid>
      <Grid
        templateColumns={{ sm: "1fr", lg: "1.3fr 1.7fr" }}
        templateRows={{ sm: "repeat(2, 1fr)", lg: "1fr" }}
        my='26px'
        gap='24px'
        mb={{ lg: "26px" }}>
        <RiskScoreOverview
          title={"Risk Score"}
          percentage={-24}
          chart={<LineChart />}
        />
        <SBOMActivities
          title={"Activities"}
          percentage={23}
          chart={<BarChart />}
        />
      </Grid>
      <Grid
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        templateRows={{ sm: "1fr auto", md: "1fr", lg: "1fr" }}
        my='26px'
        gap='24px'>
        <ProductsOverview
          title={"Products Overview"}
          amount={30}
          captions={["Product", "Versions", "SBOM Links", "Risk Score"]}
          data={productsOverviewData}
        />
        <ActivitiesOverview
          title={"Recent Activities"}
          amount={30}
          data={activitiesOverviewData}
        />
      </Grid>
    </Flex>
  );
}
