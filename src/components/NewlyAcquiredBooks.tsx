import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { BlueModalCarousel } from './BlueModalCarousel';
import { BookListModal } from './BookListModal';

const books = [
  { title: 'Introduction to Computer Science', description: 'Foundational guide to computing principles and programming logic.', icon: 'computer' },
  { title: 'Data Structures & Algorithms', description: 'Comprehensive coverage of essential data structures and algorithmic thinking.', icon: 'account_tree' },
  { title: 'Software Engineering', description: 'Architecture-driven software development methodologies and best practices.', icon: 'code' },
  { title: 'Discrete Mathematics', description: 'Mathematical foundations for computer science and problem-solving.', icon: 'calculate' },
  { title: 'Network Security', description: 'Modern approaches to securing computer networks and data transmission.', icon: 'security' },
  { title: 'Artificial Intelligence', description: 'Exploring machine learning, neural networks, and intelligent systems.', icon: 'psychology' },
  { title: 'Database Management', description: 'Design and implementation of relational and NoSQL database systems.', icon: 'storage' },
  { title: 'Web Development', description: 'Full-stack web development with modern frameworks and technologies.', icon: 'web' },
  { title: 'Operating Systems', description: 'Process management, memory allocation, and file systems.', icon: 'dns' },
  { title: 'Computer Architecture', description: 'CPU design, instruction sets, and memory hierarchy.', icon: 'memory' },
  { title: 'Programming Languages', description: 'Paradigms, syntax, semantics, and compilers.', icon: 'terminal' },
  { title: 'Machine Learning', description: 'Supervised, unsupervised, and reinforcement learning.', icon: 'smart_toy' },
  { title: 'Cybersecurity', description: 'Threat modeling, cryptography, and incident response.', icon: 'shield' },
  { title: 'Cloud Computing', description: 'IaaS, PaaS, SaaS, and distributed systems.', icon: 'cloud' },
  { title: 'Mobile App Development', description: 'iOS and Android development with modern frameworks.', icon: 'phone_android' },
  { title: 'Game Development', description: 'Unity, Unreal Engine, and game design principles.', icon: 'sports_esports' },
  { title: 'Blockchain Technology', description: 'Distributed ledgers, smart contracts, and DeFi.', icon: 'link' },
  { title: 'Data Science', description: 'Statistical analysis, visualization, and big data tools.', icon: 'bar_chart' },
  { title: 'Computer Graphics', description: 'Rendering pipelines, shaders, and 3D modeling.', icon: 'texture' },
  { title: 'Human-Computer Interaction', description: 'UX research, prototyping, and usability testing.', icon: 'hand_gesture' },
  { title: 'Compiler Design', description: 'Lexical analysis, parsing, and code generation.', icon: 'build' },
  { title: 'Parallel Computing', description: 'MPI, OpenMP, CUDA, and concurrent algorithms.', icon: 'layers' },
  { title: 'Quantum Computing', description: 'Qubits, quantum gates, and quantum algorithms.', icon: 'science' },
  { title: 'Robotics', description: 'Kinematics, sensors, and autonomous navigation.', icon: 'precision_manufacturing' },
  { title: 'Computer Vision', description: 'Image processing, object detection, and CNNs.', icon: 'visibility' },
  { title: 'Natural Language Processing', description: 'Tokenization, embeddings, and transformers.', icon: 'translate' },
  { title: 'Software Testing', description: 'Unit tests, integration tests, and CI/CD pipelines.', icon: 'bug_report' },
  { title: 'Agile Methodologies', description: 'Scrum, Kanban, and lean software development.', icon: 'sync' },
  { title: 'DevOps Practices', description: 'Containerization, orchestration, and monitoring.', icon: 'deploy' },
  { title: 'Ethical Hacking', description: 'Penetration testing, vulnerability assessment, and forensics.', icon: 'lock' },
  { title: 'Internet of Things', description: 'Embedded systems, sensors, and IoT protocols.', icon: 'sensors' },
  { title: 'Digital Signal Processing', description: 'Fourier transforms, filters, and signal analysis.', icon: 'graphic_eq' },
  { title: 'Formal Languages', description: 'Automata theory, grammars, and computability.', icon: 'functions' },
  { title: 'Information Retrieval', description: 'Search engines, indexing, and ranking algorithms.', icon: 'search' },
];

export const NewlyAcquiredBooks: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="new-books" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-8">
          <h2 className="font-headline-lg font-bold text-4xl mb-4" style={{ color: '#001851', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            Newly Acquired Books
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#001851', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Explore our latest additions — curated to support your academic journey and research needs.
          </p>
        </div>
        <div className="rounded-3xl p-6 md:p-10 shadow-2xl border border-gold-light/20" style={{ background: 'rgba(0,24,81,0.15)', backdropFilter: 'blur(4px)' }}>
          <BlueModalCarousel items={books} />
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setModalOpen(true)}
              className="bg-gold-light text-primary px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gold-pale transition-all shadow-lg cursor-pointer border-none"
            >
              View All List
            </button>
          </div>
        </div>
      </div>
      <BookListModal books={books} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
};