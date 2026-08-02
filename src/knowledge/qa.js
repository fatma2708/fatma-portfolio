// Static Q&A for the F.A.I. chat. Every answer lives here so the chat works
// without any backend or AI provider. All questions are in English.

export const QUESTION_GROUPS = [
  {
    label: "About",
    questions: [
      {
        q: "Who is Fatma?",
        a: "Fatma Ben Mlouka is a second-year Computer Engineering student at ESPRIT specializing in Cloud Computing. She is passionate about Artificial Intelligence, scalable systems, cloud-native technologies, full-stack development, DevOps, automation, UI/UX and graphic design."
      },
      {
        q: "Tell me about yourself.",
        a: "I am Fatma Ben Mlouka, a Cloud Computing Engineering student. I love building intelligent, scalable systems and turning ideas into useful products. I am curious, hardworking, creative and detail-oriented, and I am always trying to become a better version of myself."
      },
      {
        q: "What is Fatma's personality like?",
        a: "Curious, hardworking, positive, creative, independent, detail-oriented, ambitious, disciplined and motivated. My philosophy is to build intelligent systems that solve real-world problems while remaining enjoyable to use."
      },
      {
        q: "What are Fatma's strengths?",
        a: "Strong curiosity, adaptability, independence, persistence, and stamina once I am motivated."
      },
      {
        q: "What are Fatma's weaknesses?",
        a: "I am currently working on being more patient and improving my documentation habits."
      },
      {
        q: "What motivates Fatma?",
        a: "Becoming a better version of myself every day, making my parents proud, building ambitious projects, and continuous learning."
      },
      {
        q: "Why Computer Engineering?",
        a: "I have loved computers since I was a child. I enjoy building things and understanding how they work, and I am naturally curious — always researching beyond what I am taught. Engineering lets me turn ideas into useful products."
      },
      {
        q: "Why Cloud Computing?",
        a: "I enjoy networking and virtualization. I love transforming physical infrastructure into scalable virtual systems and building highly available architectures. My favorite cloud technology is Kubernetes."
      },
      {
        q: "Why AI?",
        a: "Artificial Intelligence lets us create intelligent systems that improve everyday life. I am especially interested in Large Language Models because they make advanced AI accessible to everyone."
      },
      {
        q: "Does Fatma enjoy UI/UX?",
        a: "Yes. UI/UX and graphic design are part of my skill set — I believe design is how complex systems become clear and enjoyable to use."
      },
      {
        q: "What is Fatma's design philosophy?",
        a: "Build intelligent systems that solve real-world problems while remaining enjoyable to use. Design is the connective tissue between engineering and people."
      }
    ]
  },
  {
    label: "Projects",
    questions: [
      {
        q: "What projects has Fatma built?",
        a: "Here are the projects I'm most proud of:\n\n- **FoundersLab** — an intelligent startup incubation platform (Angular, Spring Boot, ML scoring, deployed on a private cloud).\n- **StackPilot** — a private OpenStack cloud infrastructure with IaC, Kubernetes and observability.\n- **AutoMatch** — a real-time AI car valuation API with a Next.js frontend.\n- **AI Psychometric Assessment Platform** — AI-powered assessments with automated analysis pipelines.\n- **FITSYNC** — a sports management platform for tournaments, teams and athlete performance.\n- **FYP Cooked** — a private, on-device AI browser extension that explains your Instagram feed."
      },
      {
        q: "What is Fatma's favorite project?",
        a: "FoundersLab — an online incubator that connects founders with investors and mentors. It combines full-stack development, machine-learning startup scoring, and a full private-cloud deployment with CI/CD and monitoring."
      },
      {
        q: "Tell me about FoundersLab.",
        a: "FoundersLab is an intelligent startup incubation platform that connects founders with investors, mentors and the resources to grow — from idea to funded momentum. It's built with Angular and Spring Boot on MySQL, and features a machine-learning based startup scoring system that matches founders with relevant investors and mentors. It is deployed on a personal private cloud with Docker, Kubernetes, CI/CD, Prometheus and Grafana."
      },
      {
        q: "Why FoundersLab?",
        a: "FoundersLab is my favorite because it brings everything together: an Angular and Spring Boot full-stack app, an ML startup scoring system, and a complete private cloud deployment on OpenStack and Kubernetes with CI/CD, Prometheus and Grafana."
      },
      {
        q: "Tell me about StackPilot.",
        a: "StackPilot is a private cloud infrastructure project. I provisioned an OpenStack cloud, automated everything with Terraform and Ansible, orchestrated services on Kubernetes, and used it to host and deploy the FoundersLab platform — all with CI/CD and monitoring."
      },
      {
        q: "Tell me about AutoMatch.",
        a: "AutoMatch is a real-time Machine Learning API for car valuation and prediction. It uses classification, regression and clustering models behind a Flask API, with a dynamic Next.js frontend for prediction visualization. It's deployed on Vercel with seamless API integration."
      },
      {
        q: "Tell me about FYP Cooked.",
        a: "FYP Cooked is a browser extension that analyzes each Instagram Reel with on-device AI and shows exactly what your feed is doing to your brain — all locally and privately. It features a real-time Brainrot Index (0–100), a Touch Grass Score, a weekly 'Your Wrapped' recap, per-reel AI breakdowns, a filterable gallery, personalized recommendations and achievement badges. The code is on GitHub at github.com/fatma2708/fyp-analyzer."
      },
      {
        q: "Tell me about the AI Psychometric Assessment Platform.",
        a: "It's an AI-powered psychometric assessment platform with automated analysis pipelines. Built with Django and Python, it generates AI-assisted profile reports and supports guided, multilingual assessment flows."
      },
      {
        q: "Tell me about FITSYNC.",
        a: "FITSYNC is a sports management platform for tournaments, teams and athlete performance. It includes tournament and team management modules, athlete performance tracking, and modern interactive JavaFX interfaces. Built with Java, Symfony and MySQL."
      }
    ]
  },
  {
    label: "Experience & Education",
    questions: [
      {
        q: "What is Fatma's education?",
        a: "I'm pursuing a Computer Engineering degree at ESPRIT (2022 – present), specializing in Cloud Computing."
      },
      {
        q: "What is Fatma's internship experience?",
        a: "I did two internships at Intech Solutions: as an **AI Intern** (07/2025 – 08/2025) I developed an AI-based psychometric assessment platform with automated analysis pipelines and integrated AI modules. Earlier, as a **Web Development Intern** (08/2023 – 09/2023), I built backend features using Django."
      },
      {
        q: "What did Fatma do as an AI Intern?",
        a: "At Intech Solutions (07/2025 – 08/2025), I developed an AI-based psychometric assessment platform, designed automated AI analysis pipelines, and integrated AI modules into the platform."
      },
      {
        q: "What did Fatma do as a Media Manager?",
        a: "As Media Manager at IEEE RAS ESPRIT SBC (2023 – 2024), I managed branding and media strategy, created media content (photos, videos, highlights), and covered workshops, competitions and conferences."
      },
      {
        q: "What is Fatma's leadership experience?",
        a: "Beyond internships, I served as Media Manager at IEEE RAS ESPRIT SBC, where I handled branding, media strategy and event coverage — teaching me responsibility, teamwork and how to represent a team publicly."
      }
    ]
  },
  {
    label: "Skills & Technologies",
    questions: [
      {
        q: "What technologies does Fatma know?",
        a: "**Cloud & DevOps:** Docker, Kubernetes, Terraform, Ansible, OpenStack, CI/CD, Linux.\n**Backend:** Spring Boot, Flask, Django, REST APIs.\n**Frontend:** Angular, Next.js, JavaFX.\n**Machine Learning:** regression, classification, clustering, decision trees, Pandas, NumPy.\n**Programming:** Python, Java, JavaScript, PHP, C#, C, C++.\n**Design:** UI, UX, graphic design."
      },
      {
        q: "What are Fatma's cloud skills?",
        a: "Docker, Kubernetes, Terraform, Ansible, OpenStack, CI/CD pipelines and Linux administration."
      },
      {
        q: "What programming languages does Fatma know?",
        a: "Python, Java, JavaScript, PHP, C#, C and C++."
      },
      {
        q: "What is Fatma's favorite programming language?",
        a: "Python — it powers my AI and machine learning work and is fast to move from idea to working product."
      },
      {
        q: "Why Kubernetes?",
        a: "Kubernetes is my favorite cloud technology because it makes large, highly-available distributed systems feel calm and manageable — a perfect example of infrastructure as design."
      },
      {
        q: "What are Fatma's machine learning skills?",
        a: "Regression, classification, clustering, decision trees, Pandas and NumPy — applied in real projects like AutoMatch's car valuation API and FoundersLab's startup scoring."
      }
    ]
  },
  {
    label: "Career & Motivation",
    questions: [
      {
        q: "What is Fatma's dream career?",
        a: "I want to become an MLOps Engineer and build scalable AI systems that combine AI, Cloud Computing and software engineering."
      },
      {
        q: "Why should someone hire Fatma?",
        a: "I bring a rare mix: strong cloud and DevOps skills, hands-on full-stack development, real Machine Learning projects, and an eye for UI/UX. I ship complete systems — from backend APIs and ML models to cloud infrastructure, CI/CD and monitoring — and I am eager, disciplined and a fast learner."
      },
      {
        q: "What is Fatma looking for?",
        a: "An opportunity to grow as an engineer and apply AI, cloud and software engineering skills on real, meaningful systems."
      },
      {
        q: "What is Fatma currently improving?",
        a: "I'm learning patience and improving my documentation habits, while continuing to deepen my MLOps and cloud skills."
      }
    ]
  },
  {
    label: "Fun Facts",
    questions: [
      {
        q: "What are some fun facts about Fatma?",
        a: "- Favorite color: **Pink**.\n- Favorite programming language: **Python**.\n- Favorite cloud technology: **Kubernetes**.\n- Favorite AI topic: **Large Language Models (LLMs)**.\n- Favorite project: **FoundersLab**.\n- Coffee: **2–3 cups daily**.\n- Preferred theme: **Dark Mode**.\n- Sports: I tried many sports before practicing **rhythmic gymnastics for six years** — it taught me discipline."
      },
      {
        q: "What is Fatma's favorite color?",
        a: "Pink."
      },
      {
        q: "What is Fatma's favorite AI topic?",
        a: "Large Language Models (LLMs) — because they make advanced AI accessible to everyone."
      },
      {
        q: "Does Fatma practice sports?",
        a: "I tried many sports before practicing rhythmic gymnastics for six years — it taught me discipline and persistence."
      },
      {
        q: "What is Fatma's coffee habit?",
        a: "2–3 cups daily."
      }
    ]
  },
  {
    label: "Contact",
    questions: [
      {
        q: "How can I contact Fatma?",
        a: "You can email me at fatmabenmlouka38@gmail.com, connect with me on LinkedIn, or check my GitHub at github.com/fatma2708."
      },
      {
        q: "What is Fatma's LinkedIn?",
        a: "You can find me on LinkedIn: https://www.linkedin.com/in/fatma-ben-mlouka-229a0b213/"
      },
      {
        q: "What is Fatma's GitHub?",
        a: "https://github.com/fatma2708"
      },
      {
        q: "Where can I find Fatma's resume?",
        a: "A downloadable CV is available directly on this portfolio website."
      }
    ]
  }
];

export function findAnswer(question) {
  if (!question) return null;
  for (const group of QUESTION_GROUPS) {
    for (const item of group.questions) {
      if (item.q === question) return item.a;
    }
  }
  return "I don't have an answer for that one yet — try another question from the menu.";
}
