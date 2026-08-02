import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

const mockMatchMedia = () =>
  jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }));

// Needed at import time (gsap registers ScrollTrigger on module load).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia()
});

beforeEach(() => {
  // CRA enables "resetMocks", which wipes module-scope jest.fn() implementations
  // before each test, so matchMedia must be (re)defined per test.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: mockMatchMedia()
  });
});

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
