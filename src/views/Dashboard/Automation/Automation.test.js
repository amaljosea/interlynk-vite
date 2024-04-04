import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Automation from ".";
import { MockedProvider } from "@apollo/client/testing";

jest.mock("hooks/useGlobalState", () => ({
  useGlobalState: () => ({
    totalRows: 0,
    prodRulesState: {},
    dispatch: {},
  }),
}));

test("Automation page renders correctly", () => {
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Automation />
    </MockedProvider>
  );
  const textElement = screen.getByText("RULE APPLIES TO");
  expect(textElement).toBeInTheDocument();
});
