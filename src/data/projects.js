export const projectsData = [
  {
    id: 'cyber-city-3d',
    title: 'CyberCity 3D World',
    category: 'webgl',
    categoryName: 'WebGL / 3D',
    description: 'Real-time interactive 3D futuristic cityscape built for fun with custom lighting, WebGL shaders, and audio.',
    longDescription: 'CyberCity 3D is a browser-based real-time 3D cityscape created by Jisanahamed Mithu as a WebGL experiment. It features custom PBR shaders, procedural building generation, volumetric fog, and interactive camera dynamics.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    tags: ['Three.js', 'WebGL', 'GLSL', 'TypeScript', 'WebAudio'],
    highlights: [
      'Rendered 500,000+ polygons at steady 60 FPS across desktop and mobile browsers.',
      'Custom GLSL bloom shader pipeline with dynamic scroll-driven camera motion.',
      'Spatial audio nodes for environmental sound positioning.'
    ],
    demoUrl: 'https://example.com/cyber-city',
    githubUrl: 'https://github.com/example/cyber-city-3d'
  },
  {
    id: 'creative-code-pulse',
    title: 'CodePulse Developer Suite',
    category: 'creative',
    categoryName: 'Creative Code',
    description: 'Intelligent code generation and automated syntax analyzer platform with vector indexing.',
    longDescription: 'CodePulse provides developers with instant contextual code recommendations, automated refactoring suggestions, and security vulnerability scans using smart AST parsing over local codebases.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
    tags: ['Python', 'FastAPI', 'React', 'Vector Index', 'Node.js'],
    highlights: [
      'High-performance streaming SSE endpoint reducing TTFT latency by 45%.',
      'AST parser for precise code chunking before vector embedding.',
      '98% accuracy in automated code flaw detection benchmarks.'
    ],
    demoUrl: 'https://example.com/codepulse',
    githubUrl: 'https://github.com/example/codepulse-code'
  },
  {
    id: 'nexus-analytics-dashboard',
    title: 'Nexus Analytics Canvas',
    category: 'fullstack',
    categoryName: 'Full Stack',
    description: 'Interactive data visualization suite with live WebSocket streaming telemetry and customizable widgets.',
    longDescription: 'Nexus Analytics is an end-to-end data platform enabling high-volume telemetry ingestion, interactive Chart.js/D3 visualization dashboards, and role-based access control.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    tags: ['Next.js', 'Node.js', 'PostgreSQL', 'WebSockets', 'TailwindCSS'],
    highlights: [
      'Handled over 10,000 live WebSocket data points per second with zero UI lag.',
      'Responsive drag-and-drop dashboard grid layout component.',
      'Automated PDF/CSV report export pipeline.'
    ],
    demoUrl: 'https://example.com/nexus-analytics',
    githubUrl: 'https://github.com/example/nexus-analytics'
  },
  {
    id: 'orbit-augmented-shopping',
    title: 'Orbit AR View',
    category: 'mobile',
    categoryName: 'Mobile & AR',
    description: 'WebXR augmented reality product preview application for iOS and Android web browsers.',
    longDescription: 'Orbit AR allows users to place 3D virtual furniture models in physical spaces using WebXR and QuickLook, exploring interactive spatial models directly in the browser.',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop',
    tags: ['WebXR', 'Three.js', 'USDZ', 'glTF', 'Vue.js'],
    highlights: [
      'Cross-platform WebXR surface tracking across iOS & Android.',
      'Optimized 3D model compression with Draco geometry pipelines.',
      'Interactive WebXR gesture controls and lighting adaptation.'
    ],
    demoUrl: 'https://example.com/orbit-ar',
    githubUrl: 'https://github.com/example/orbit-ar-shopping'
  },
  {
    id: 'synthwave-audio-visualizer',
    title: 'SynthWave Audio Spectrum',
    category: 'webgl',
    categoryName: 'WebGL / 3D',
    description: 'GPU-accelerated audio frequency visualizer with responsive particle reactions and audio spectrum analysis.',
    longDescription: 'An interactive WebGL music visualizer that extracts real-time audio FFT frequency data using Web Audio API and maps frequency bands to particle displacement shaders.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
    tags: ['Three.js', 'Web Audio API', 'Canvas2D', 'ShaderMaterial'],
    highlights: [
      'Real-time FFT audio spectrum analyzer with 64 frequency band bins.',
      'Dynamic beat detection triggering reactive background camera movement.',
      'Customizer allowing visual preset sharing.'
    ],
    demoUrl: 'https://example.com/synthwave',
    githubUrl: 'https://github.com/example/synthwave-audio'
  },
  {
    id: 'quantum-cloud-platform',
    title: 'Quantum Deploy Dashboard',
    category: 'fullstack',
    categoryName: 'Full Stack',
    description: 'Developer infrastructure dashboard for managing microservices, container deployments, and server logs.',
    longDescription: 'Quantum Deploy streamlines container orchestration by giving engineering teams instant visibility into Kubernetes cluster node health, continuous integration pipelines, and deployment rollbacks.',
    image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1000&auto=format&fit=crop',
    tags: ['Go', 'Docker', 'React', 'GraphQL', 'TailwindCSS'],
    highlights: [
      'Streamlined deployment rollback workflow from 15 minutes to under 10 seconds.',
      'Real-time log viewer supporting regex search across 50+ service pods.',
      'OAuth2 SSO authentication.'
    ],
    demoUrl: 'https://example.com/quantum-deploy',
    githubUrl: 'https://github.com/example/quantum-deploy-cloud'
  }
];

export const projectCategories = [
  { id: 'all', label: 'All Experiments' },
  { id: 'webgl', label: 'WebGL & 3D' },
  { id: 'creative', label: 'Creative Code' },
  { id: 'fullstack', label: 'Full Stack' },
  { id: 'mobile', label: 'Mobile & AR' }
];
