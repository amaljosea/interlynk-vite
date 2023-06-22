// import
import SBOMs from "views/SBOM/SBOMs";

import {
  HomeIcon,
} from "components/Icons/Icons";

import {
  FaWindowMaximize,
  FaRegChartBar,
  FaRegSun,
  FaCode
} from "react-icons/fa";

var routesMonitor = [
  {
    path: "/sbom",
    name: "SBOM",
    icon: <FaCode color="inherit" />,
    component: SBOMs,
    layout: "/sbom",
  }
];

export default routesMonitor;
