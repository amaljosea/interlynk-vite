// Chakra imports
import { Flex, Menu, MenuList, MenuItem, MenuButton, MenuOptionGroup, MenuItemOption, Button, Input, Spacer, Stack } from "@chakra-ui/react";
import React from "react";
import ProductVersions from "./components/ProductVersions";
import { productVersionsData } from "variables/general";
import { ChevronDownIcon, AddIcon, LinkIcon, CopyIcon } from "@chakra-ui/icons";
import SBOMLinkDrawer from "components/Drawer/SBOMLinkDrawer.js";
import ProductAssembleDrawer from "components/Drawer/ProductAssembleDrawer.js";

import {
  useDisclosure
} from '@chakra-ui/react'

function Products() {
  const { isOpen: isOpenProduct, onOpen: onOpenProduct, onClose: onCloseProduct } = useDisclosure()
  const { isOpen: isOpenSBOMLink, onOpen: onOpenSBOMLink, onClose: onCloseSBOMLink } = useDisclosure()
  const uniqProjects = [];
  const btnRefProduct = React.useRef('Product')
  const btnRefSBOMLink = React.useRef('SBOMLink')

  productVersionsData.map(project => {
    if (uniqProjects.indexOf(project.name) === -1) {
      uniqProjects.push(project.name)
    }
  });
  const uniqVersions = [];
  productVersionsData.map(project => {
      project.versions.map(version => {
        if (uniqVersions.indexOf(version.version) === -1) {
          uniqVersions.push(version.version)
        }
      });
  });

  return (
    <Flex direction='column' pt={{ base: "120px", md: "0px" }}>
        <Flex direction='row'  pt={{ base: "200px", md: "75px" }}>
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
            { uniqProjects.map((p) => (<MenuItemOption key={p} value={p}>{p}</MenuItemOption>)) }
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
        <Input placeholder='Search' maxW='300px' />
        <Spacer />
        <Stack direction='row' spacing={2}>
        <Button
          ref={btnRefProduct}
          onClick={onOpenProduct}
          leftIcon={<AddIcon />}
          colorScheme='green'
          size='sm'
          variant='solid'
          borderRadius='6px'>
            Product
          </Button>
          <ProductAssembleDrawer
            isOpen={isOpenProduct}
            onClose={onCloseProduct}
            btnRef={btnRefProduct}
            uniqProjects={uniqProjects}
            uniqVersions={uniqVersions}
            link={[]}
            shared_with={[]}
            components={true}
            licenses={true}
            vulnerability={false}
            conf_email={true}
            conf_terms={true}
            redactions={false}
            cyclonedx={true}
            spdx={true}
          />
        <Button
          ref={btnRefSBOMLink}
          onClick={onOpenSBOMLink}
          leftIcon={<AddIcon />}
          colorScheme='blue'
          size='sm'
          variant='solid'
          borderRadius='6px'>
            SBOM Link
          </Button>
          <SBOMLinkDrawer
            isOpen={isOpenSBOMLink}
            onClose={onCloseSBOMLink}
            btnRef={btnRefSBOMLink}
            uniqProjects={uniqProjects}
            uniqVersions={uniqVersions}
            link={[]}
            shared_with={[]}
            components={true}
            licenses={true}
            vulnerability={false}
            conf_email={true}
            conf_terms={true}
            redactions={false}
            cyclonedx={true}
            spdx={true}
          />
          </Stack>
      </Flex>
      <ProductVersions
        title={"Products"}
        captions={["Active", "Product", "Version", "SBOM Links", "Risk Score", "Last Updated", ""]}
        productVersionsData={productVersionsData}
      />
    </Flex>
  );
}

export default Products;
