# Fatma Ben Mlouka — Portfolio

Hi, I'm **Fatma** — a second-year Computer Engineering student at **ESPRIT**, specializing in **Cloud Computing**. I build intelligent, scalable systems and love turning ideas into useful products.

This is the repo of my personal portfolio, **FATMA OS**, a playful desktop-style website where you can explore my projects, skills, experience and more — and ask my AI assistant, **F.A.I.**, about anything you want to know.

> Live site: [https://fatma-portfolio.vercel.app](https://fatma-portfolio.vercel.app)

## About me

- Cloud Computing Engineering student at ESPRIT (2022 – present)
- Passionate about Artificial Intelligence, cloud-native technologies, scalable systems, full-stack development, DevOps, automation, UI/UX and graphic design
- Favorite cloud technology: Kubernetes
- Career goal: become an **MLOps Engineer** and build scalable AI systems
- I tried many sports before practicing rhythmic gymnastics for six years — it taught me discipline

## Featured projects

| Project | Description | Stack |
| --- | --- | --- |
| **FoundersLab** | Intelligent startup incubation platform connecting founders with investors and mentors, with ML-based startup scoring, deployed on a private cloud | Angular, Spring Boot, MySQL, OpenStack, Docker, Kubernetes, Prometheus, Grafana |
| **StackPilot** | Private OpenStack cloud infrastructure, automated end to end and used to host FoundersLab | OpenStack, Terraform, Ansible, Docker, Kubernetes, CI/CD |
| **AutoMatch** | Real-time Machine Learning API for car valuation and prediction | Flask, scikit-learn models, Next.js |
| **AI Psychometric Assessment Platform** | AI-powered psychometric assessments with automated analysis pipelines | Django, Python |
| **FITSYNC** | Sports management platform for tournaments, teams and athlete performance | Java, Symfony, JavaFX, MySQL |
| **FYP Cooked** | Your FYP, explained — a private, on-device AI browser extension that analyzes your Instagram feed | Browser extension, on-device AI, local-first |

## Experience

- **AI Intern** — Intech Solutions (07/2025 – 08/2025): developed an AI-based psychometric assessment platform with automated analysis pipelines
- **Web Development Intern** — Intech Solutions (08/2023 – 09/2023): built backend features with Django
- **Media Manager** — IEEE RAS ESPRIT SBC (2023 – 2024): branding, media strategy and event coverage

## Skills

- **Cloud & DevOps:** Docker, Kubernetes, Terraform, Ansible, OpenStack, CI/CD, Linux
- **Backend:** Spring Boot, Flask, Django, REST APIs
- **Frontend:** Angular, Next.js, JavaFX, React
- **Machine Learning:** regression, classification, clustering, decision trees, Pandas, NumPy
- **Programming:** Python, Java, JavaScript, PHP, C#, C, C++
- **Design:** UI, UX, graphic design

## About this portfolio (FATMA OS)

- A desktop-inspired personal OS interface built with **React** and **Sass**, animated with **GSAP** and **Lenis**
- **F.A.I.** (Fatma Artificial Intelligence) — a chat assistant with a curated list of questions and instant answers about Fatma's projects, experience and skills
- A secure backend (`server/`) built with **Express 5 + TypeScript**, with validation, rate limiting, security headers and a Gemini-ready chat API
- Deployed with **Vercel** (frontend) and **Railway** (backend), with CI/CD via GitHub Actions

### Run locally

```bash
# Frontend
npm install
npm start                    # http://localhost:3000

# Backend (optional — for the F.A.I. chat API)
cd server
npm install
cp .env.example .env         # add GEMINI_API_KEY if you want Gemini
npm run dev                  # http://localhost:4000
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment and [POST_DEPLOYMENT_CHECKLIST.md](POST_DEPLOYMENT_CHECKLIST.md) for post-deploy verification.

## Contact

- Email: fatmabenmlouka38@gmail.com
- LinkedIn: [fatma-ben-mlouka](https://www.linkedin.com/in/fatma-ben-mlouka-229a0b213/)
- GitHub: [fatma2708](https://github.com/fatma2708)
- A downloadable CV is available on the portfolio website.
