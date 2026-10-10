-- ===================================================
-- Optional Seed Data: University Research Opportunity Portal
-- Insert sample opportunities into the database
-- ===================================================

USE research_opportunity_db;

-- Insert 4 realistic research opportunities
INSERT INTO research_opportunities 
  (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
VALUES
  (
    'Deep Learning for Medical Image Segmentation',
    'Investigating convolutional neural networks and vision transformers for automated segmentation of MRI scans to aid early clinical diagnosis.',
    'Artificial Intelligence',
    'Dr. Omer Usman',
    'Computer Science',
    'Python, PyTorch, OpenCV, Machine Learning Basics',
    2,
    '2026-11-15',
    'Open'
  ),
  (
    'Graph Theory Applications in Network Optimization',
    'Applying advanced graph theory algorithms to optimize routing and minimize latency in large-scale computer networks.',
    'Discrete Structures',
    'Dr. Noman Azam',
    'Computer Science',
    'Discrete Mathematics, Graph Theory, Python',
    3,
    '2026-11-30',
    'Open'
  ),
  (
    'Scalable Analytics Pipelines for Large Datasets',
    'Designing and evaluating distributed data processing pipelines for high-throughput, real-time analytics.',
    'Big Data',
    'Ms. Sana Jehan',
    'Computer Science',
    'Python, SQL, Hadoop, Spark',
    1,
    '2026-12-10',
    'Open'
  ),
  (
    'FPGA-Based Digital Circuit Design and Simulation',
    'Developing hardware accelerators for cryptographic algorithms using Field Programmable Gate Arrays (FPGAs).',
    'Digital Logic Design',
    'Dr. Usman Abbassi',
    'Computer Science',
    'Digital Logic Design, Verilog, Boolean Algebra',
    2,
    '2026-09-30',
    'Closed'
  );
