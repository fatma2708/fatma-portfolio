import React, {lazy, Suspense} from "react";
import FatmaOS from "./components/fatma-os/FatmaOS";
import {PageProvider} from "./contexts/PageContext";
import "./components/fatma-os/fatma-os.scss";

const FaiChat = lazy(() => import("./components/fai/FaiChat"));

export default function App() {
  return (
    <PageProvider>
      <FatmaOS />
      <Suspense fallback={null}>
        <FaiChat />
      </Suspense>
    </PageProvider>
  );
}
