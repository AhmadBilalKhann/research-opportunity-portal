-- ===================================================
-- University Research Opportunity Portal
-- Optional Seed Data Script
-- ===================================================
-- Populate initial realistic research opportunities
-- for development and testing purposes.
-- (This file is completely optional; you can start with
-- an empty database if preferred).
-- ===================================================

USE research_opportunity_db;

INSERT INTO research_opportunities (
  title,
  description,
  research_area,
  faculty_name,
  department,
  required_skills,
  available_positions,
  application_deadline,
  status
) VALUES
(
  'Deep Learning for Medical Image Segmentation',
  'Investigating convolutional neural networks and vision transformers for automated segmentation of MRI scans to aid early clinical diagnosis.',
  'Artificial Intelligence',
  'Dr. Sarah Khan',
  'Computer Science',
  'Python, PyTorch, OpenCV, Machine Learning Basics',
  2,
  '2026-11-15',
  'Open'
),
(
  'Low-Latency Edge Routing Protocols for IoT Smart Cities',
  'Designing and evaluating lightweight SDN-based routing protocols to minimize end-to-end latency in dense urban IoT sensor networks.',
  'Computer Networks',
  'Dr. Usman Tariq',
  'Computer Science',
  'C++, Mininet, Wireshark, Computer Networks',
  3,
  '2026-11-30',
  'Open'
),
(
  'Automated Vulnerability Detection in Smart Contracts',
  'Developing static analysis and symbolic execution tools to detect reentrancy and integer overflow vulnerabilities in Ethereum smart contracts.',
  'Cybersecurity',
  'Dr. Ayesha Malik',
  'Software Engineering',
  'Solidity, Python, Software Testing, Static Analysis',
  1,
  '2026-10-25',
  'Open'
),
(
  'Multilingual Sentiment Analysis for Regional Languages',
  'Benchmarking large language models and fine-tuning BERT-based architectures for sentiment classification in under-resourced regional dialects.',
  'Natural Language Processing',
  'Dr. Bilal Ahmed',
  'Data Science',
  'Python, HuggingFace Transformers, Pandas, NLP',
  2,
  '2026-09-30',
  'Closed'
);
