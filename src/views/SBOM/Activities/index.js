// Chakra imports
import { Flex, Menu, MenuList, MenuItem, MenuButton, MenuOptionGroup, MenuItemOption, Button, Input, Spacer } from "@chakra-ui/react";
import React from "react";
import ActivityLog from "./components/ActivityLog";
import { activitiesDataLong } from "variables/general";
import { ChevronDownIcon } from "@chakra-ui/icons";


function Activities() {
  const uniqProjects = [];
  activitiesDataLong.map(project => {
      if (uniqProjects.indexOf(project.product) === -1) {
        uniqProjects.push(project.product)
      }
  });
  const uniqVersions = [];
  activitiesDataLong.map(project => {
      if (uniqVersions.indexOf(project.version) === -1) {
        uniqVersions.push(project.version)
      }
  });
  const uniqUsers = [];
  activitiesDataLong.map(project => {
      if (uniqUsers.indexOf(project.user) === -1) {
        uniqUsers.push(project.user)
      }
  });
  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Flex direction='row'  pt={{ base: "120px", md: "0px" }}>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} maxW='150px'
            px={4}
            py={2}
            me={2}
            transition='all 0.2s'
            borderRadius='md'
            borderWidth='1px'
            fontSize='sm'
            fontWeight='none'>
            All Products
          </MenuButton>
        <MenuList fontWeight='none' fontSize='sm'>
        <MenuOptionGroup title='Products' type='checkbox'>
        { uniqProjects.map((p) => (<MenuItemOption value={p}>{p}</MenuItemOption>)) }
        </MenuOptionGroup>
        </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} maxW='150px'
            px={4}
            py={2}
            me={2}
            transition='all 0.2s'
            borderRadius='md'
            borderWidth='1px'
            fontSize='sm'
            fontWeight='none'>
            All Versions
          </MenuButton>
        <MenuList fontWeight='none' fontSize='sm'>
        <MenuOptionGroup title='Version' type='checkbox'>
          <MenuItemOption>GitHub</MenuItemOption>
          <MenuItemOption>SBOM</MenuItemOption>
          <MenuItemOption>Assembled</MenuItemOption>
        </MenuOptionGroup>
        </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} maxW='150px'
            px={4}
            py={2}
            me={2}
            transition='all 0.2s'
            borderRadius='md'
            borderWidth='1px'
            fontSize='sm'
            fontWeight='none'>
            All Users
          </MenuButton>
        <MenuList fontWeight='none' fontSize='sm'>
        <MenuOptionGroup title='Users' type='checkbox'>
        { uniqUsers.map((v) => (<MenuItemOption value={v}>{v}</MenuItemOption>)) }
        </MenuOptionGroup>
        </MenuList>
        </Menu>
        <Input placeholder='Search' maxW='300px' />
      </Flex>
      <ActivityLog
        title={"Activities"}
        captions={["Type", "Product", "Version", "User", "Notes", "Timestamp"]}
        data={activitiesDataLong}
      />
    </Flex>
  );
}

export default Activities;
