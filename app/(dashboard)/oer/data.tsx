import {
  BookOpen,
  GraduationCap,
  Globe,
  Microscope,
  Library,
  Search,
  ExternalLink,
  Brain,
  FileText,
  Calculator,
  Beaker,
  Users,
  Archive,
  Lightbulb,
  Target,
  LucideIcon,
} from "lucide-react";

export interface OERResource {
  name: string;
  link: string;
  summary: string;
  category: string;
  icon: LucideIcon;
  color: string;
}

export interface OERDataStructure {
  resources: {
    open_courseware_and_moocs: OERResource[];
    research_and_open_access_repositories: OERResource[];
    simulations_and_virtual_labs: OERResource[];
    oer_and_digital_libraries: OERResource[];
    academic_and_research_tools: OERResource[];
  };
  getAllResources: () => OERResource[];
  getResourcesByCategory: (category: string) => OERResource[];
  getCategories: () => string[];
}

const OERData: OERDataStructure = {
  resources: {
    open_courseware_and_moocs: [
      {
        name: "MIT OpenCourseWare (OCW)",
        link: "https://ocw.mit.edu",
        summary:
          "Provides free access to materials from virtually all MIT courses, including syllabi, lecture notes, and videos. A gold standard for open education, especially in science and engineering.",
        category: "Open Courseware & MOOCs",
        icon: GraduationCap,
        color: "from-blue-500 to-blue-600",
      },
      {
        name: "Harvard Online Courses",
        link: "https://pll.harvard.edu/catalog/free",
        summary:
          "A selection of free online courses from Harvard's various schools, covering subjects from computer science (like CS50) to humanities and business.",
        category: "Open Courseware & MOOCs",
        icon: GraduationCap,
        color: "from-blue-500 to-blue-600",
      },
      {
        name: "edX",
        link: "https://www.edx.org",
        summary:
          "A MOOC provider founded by Harvard and MIT, hosting thousands of university-level courses. Most courses can be audited for free to access lectures and materials.",
        category: "Open Courseware & MOOCs",
        icon: GraduationCap,
        color: "from-blue-500 to-blue-600",
      },
      {
        name: "Coursera",
        link: "https://www.coursera.org",
        summary:
          "Partners with top universities and companies to offer courses, specializations, and degrees. Many courses can be audited for free, providing access to video lectures.",
        category: "Open Courseware & MOOCs",
        icon: GraduationCap,
        color: "from-blue-500 to-blue-600",
      },
      {
        name: "OpenStax",
        link: "https://openstax.org",
        summary:
          "An initiative by Rice University providing high-quality, peer-reviewed, and openly licensed textbooks for free, serving as a great alternative to traditional textbooks.",
        category: "Open Courseware & MOOCs",
        icon: BookOpen,
        color: "from-blue-500 to-blue-600",
      },
    ],
    research_and_open_access_repositories: [
      {
        name: "Directory of Open Access Journals (DOAJ)",
        link: "https://www.doaj.org",
        summary:
          "A community-curated online directory that indexes and provides access to high-quality, open access, peer-reviewed journals across all disciplines.",
        category: "Research & Open Access",
        icon: FileText,
        color: "from-emerald-500 to-emerald-600",
      },
      {
        name: "JSTOR",
        link: "https://www.jstor.org",
        summary:
          "A premier digital library for academics. While largely subscription-based, it has a growing collection of open access journals and books.",
        category: "Research & Open Access",
        icon: Library,
        color: "from-emerald-500 to-emerald-600",
      },
      {
        name: "arXiv.org",
        link: "https://arxiv.org",
        summary:
          "A repository of electronic pre-prints of scientific papers in fields like physics, mathematics, and computer science, offering access to cutting-edge research.",
        category: "Research & Open Access",
        icon: Search,
        color: "from-emerald-500 to-emerald-600",
      },
      {
        name: "Google Scholar",
        link: "https://scholar.google.com",
        summary:
          "An indispensable tool for broadly searching scholarly literature, including articles, theses, books, and abstracts from academic publishers and repositories.",
        category: "Research & Open Access",
        icon: Search,
        color: "from-emerald-500 to-emerald-600",
      },
      {
        name: "PubMed Central (PMC)",
        link: "https://www.ncbi.nlm.nih.gov/pmc/",
        summary:
          "A free full-text archive of biomedical and life sciences journal literature at the U.S. National Institutes of Health (NIH), essential for health sciences.",
        category: "Research & Open Access",
        icon: Beaker,
        color: "from-emerald-500 to-emerald-600",
      },
    ],
    simulations_and_virtual_labs: [
      {
        name: "PhET Interactive Simulations",
        link: "https://phet.colorado.edu",
        summary:
          "From the University of Colorado Boulder, PhET offers a huge collection of free, interactive math and science simulations designed to engage students.",
        category: "Simulations & Virtual Labs",
        icon: Microscope,
        color: "from-purple-500 to-purple-600",
      },
      {
        name: "LabXchange",
        link: "https://www.labxchange.org",
        summary:
          "Powered by Harvard, this is a free online platform for science education with interactive virtual lab simulations, videos, and assessments.",
        category: "Simulations & Virtual Labs",
        icon: Microscope,
        color: "from-purple-500 to-purple-600",
      },
      {
        name: "MERLOT",
        link: "https://www.merlot.org/merlot/",
        summary:
          "A curated collection of free online learning materials, including thousands of peer-reviewed simulations, case studies, and tutorials for higher education.",
        category: "Simulations & Virtual Labs",
        icon: Globe,
        color: "from-purple-500 to-purple-600",
      },
      {
        name: "MyOpenMath",
        link: "https://www.myopenmath.com",
        summary:
          "A free, open-source online homework system for mathematics and quantitative fields, providing algorithmically generated problems for endless practice.",
        category: "Simulations & Virtual Labs",
        icon: Calculator,
        color: "from-purple-500 to-purple-600",
      },
      {
        name: "ChemCollective",
        link: "http://chemcollective.org",
        summary:
          "Provides virtual labs, scenario-based learning activities, and tutorials for chemistry, allowing students to perform experiments in a safe, virtual environment.",
        category: "Simulations & Virtual Labs",
        icon: Beaker,
        color: "from-purple-500 to-purple-600",
      },
    ],
    oer_and_digital_libraries: [
      {
        name: "OER Commons",
        link: "https://www.oercommons.org",
        summary:
          "A comprehensive digital public library of open educational resources, allowing instructors to find, create, and share course content.",
        category: "OER & Digital Libraries",
        icon: Library,
        color: "from-teal-500 to-cyan-500",
      },
      {
        name: "Khan Academy",
        link: "https://www.khanacademy.org",
        summary:
          "Provides excellent video tutorials on foundational university-level subjects like calculus, organic chemistry, and economics, ideal for reviewing prerequisite knowledge.",
        category: "OER & Digital Libraries",
        icon: Lightbulb,
        color: "from-teal-500 to-cyan-500",
      },
      {
        name: "Project Gutenberg",
        link: "https://www.gutenberg.org",
        summary:
          "A library of over 70,000 free eBooks, with a focus on classic literature and historical texts for which U.S. copyright has expired.",
        category: "OER & Digital Libraries",
        icon: BookOpen,
        color: "from-teal-500 to-cyan-500",
      },
      {
        name: "Internet Archive",
        link: "https://archive.org",
        summary:
          "A non-profit digital library offering free access to millions of books, movies, software, and archived websites via the Wayback Machine.",
        category: "OER & Digital Libraries",
        icon: Archive,
        color: "from-teal-500 to-cyan-500",
      },
    ],
    academic_and_research_tools: [
      {
        name: "Semantic Scholar",
        link: "https://www.semanticscholar.org",
        summary:
          "An AI-powered research tool that helps users navigate scientific literature by providing summaries, citation context, and connections between studies.",
        category: "Academic & Research Tools",
        icon: Brain,
        color: "from-indigo-500 to-indigo-600",
      },
      {
        name: "Zotero",
        link: "https://www.zotero.org",
        summary:
          "A free and easy-to-use tool to help users collect, organize, cite, and share research. It is essential for managing bibliographies and references.",
        category: "Academic & Research Tools",
        icon: FileText,
        color: "from-indigo-500 to-indigo-600",
      },
      {
        name: "Hypothes.is",
        link: "https://web.hypothes.is",
        summary:
          "An open-source collaborative annotation tool that allows users to annotate web pages and PDFs, fostering deeper engagement with texts.",
        category: "Academic & Research Tools",
        icon: Target,
        color: "from-indigo-500 to-indigo-600",
      },
      {
        name: "Wolfram|Alpha",
        link: "https://www.wolframalpha.com",
        summary:
          "A computational knowledge engine that computes answers to problems and provides expert-level data, useful for STEM and social sciences.",
        category: "Academic & Research Tools",
        icon: Calculator,
        color: "from-indigo-500 to-indigo-600",
      },
    ],
  },

  // Helper function to get all resources as a flat array
  getAllResources: function (): OERResource[] {
    const allResources: OERResource[] = [];
    Object.values(this.resources).forEach(
      (categoryResources: OERResource[]) => {
        allResources.push(...categoryResources);
      }
    );
    return allResources;
  },

  // Helper function to get resources by category
  getResourcesByCategory: function (category) {
    const categoryKey = Object.keys(this.resources).find(
      (key) => this.resources[key][0]?.category === category
    );
    return categoryKey ? this.resources[categoryKey] : [];
  },

  // Helper function to get unique categories
  getCategories: function (): string[] {
    const categories = new Set<string>();
    Object.values(this.resources).forEach(
      (categoryResources: OERResource[]) => {
        if (categoryResources.length > 0) {
          categories.add(categoryResources[0].category);
        }
      }
    );
    return Array.from(categories);
  },
};

export default OERData;
