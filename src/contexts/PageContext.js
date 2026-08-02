import React, {createContext, useContext, useEffect, useState} from "react";

const PageContext = createContext({section: "", project: "", setProject: () => {}});

const SECTION_IDS = ["identity", "missions", "skills", "journey", "contact"];

export function PageProvider({children}) {
  const [section, setSection] = useState("");
  const [project, setProject] = useState("");

  useEffect(() => {
    const elements = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setSection(visible.target.id);
      },
      {threshold: [0.2, 0.5, 0.8]}
    );

    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return <PageContext.Provider value={{section, project, setProject}}>{children}</PageContext.Provider>;
}

export function usePage() {
  return useContext(PageContext);
}
