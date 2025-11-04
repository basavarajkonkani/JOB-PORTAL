import dotenv from 'dotenv';
dotenv.config();

import { getFirestore } from '../config/firebase';
import admin from 'firebase-admin';

const sampleCompanies = [
  {
    name: 'TechCorp',
    description: 'Leading technology company specializing in cloud solutions',
    industry: 'Technology',
    size: '50-200',
    location: 'San Francisco, CA',
    website: 'https://techcorp.example.com',
  },
  {
    name: 'DataSystems',
    description: 'Data analytics and business intelligence platform',
    industry: 'Software',
    size: '200-500',
    location: 'New York, NY',
    website: 'https://datasystems.example.com',
  },
  {
    name: 'CloudWorks',
    description: 'Cloud infrastructure and DevOps solutions',
    industry: 'Cloud Services',
    size: '100-250',
    location: 'Seattle, WA',
    website: 'https://cloudworks.example.com',
  },
  {
    name: 'AI Innovations',
    description: 'Artificial intelligence and machine learning research',
    industry: 'Artificial Intelligence',
    size: '50-150',
    location: 'Austin, TX',
    website: 'https://aiinnovations.example.com',
  },
  {
    name: 'FinTech Solutions',
    description: 'Financial technology and payment processing',
    industry: 'Finance',
    size: '150-300',
    location: 'Boston, MA',
    website: 'https://fintechsolutions.example.com',
  },
  {
    name: 'HealthTech',
    description: 'Healthcare technology and telemedicine platform',
    industry: 'Healthcare',
    size: '75-200',
    location: 'Chicago, IL',
    website: 'https://healthtech.example.com',
  },
];

const sampleJobs = [
  {
    title: 'Senior Full Stack Developer',
    level: 'Senior',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    description: 'We are looking for an experienced Full Stack Developer to join our team. You will work on building scalable web applications using modern technologies.',
    requirements: ['5+ years of experience', 'React, Node.js, TypeScript', 'AWS or GCP experience'],
    compensation: { min: 120000, max: 180000, currency: 'USD' },
    benefits: ['Health insurance', 'Remote work', '401k matching'],
    status: 'active',
  },
  {
    title: 'Data Engineer',
    level: 'Mid-level',
    location: 'New York, NY',
    type: 'Full-time',
    remote: false,
    description: 'Join our data team to build and maintain data pipelines and infrastructure.',
    requirements: ['3+ years of experience', 'Python, SQL, Spark', 'ETL experience'],
    compensation: { min: 100000, max: 140000, currency: 'USD' },
    benefits: ['Health insurance', 'Stock options', 'Learning budget'],
    status: 'active',
  },
  {
    title: 'DevOps Engineer',
    level: 'Senior',
    location: 'Seattle, WA',
    type: 'Full-time',
    remote: true,
    description: 'Help us build and maintain our cloud infrastructure and CI/CD pipelines.',
    requirements: ['5+ years of experience', 'Kubernetes, Docker, Terraform', 'AWS experience'],
    compensation: { min: 130000, max: 170000, currency: 'USD' },
    benefits: ['Health insurance', 'Remote work', 'Unlimited PTO'],
    status: 'active',
  },
  {
    title: 'Machine Learning Engineer',
    level: 'Mid-level',
    location: 'Austin, TX',
    type: 'Full-time',
    remote: true,
    description: 'Work on cutting-edge ML models and deploy them to production.',
    requirements: ['3+ years of experience', 'Python, TensorFlow/PyTorch', 'ML deployment experience'],
    compensation: { min: 110000, max: 150000, currency: 'USD' },
    benefits: ['Health insurance', 'Remote work', 'Conference budget'],
    status: 'active',
  },
  {
    title: 'Backend Developer',
    level: 'Junior',
    location: 'Boston, MA',
    type: 'Full-time',
    remote: false,
    description: 'Join our backend team to build scalable APIs and microservices.',
    requirements: ['1-2 years of experience', 'Node.js or Python', 'REST API experience'],
    compensation: { min: 70000, max: 90000, currency: 'USD' },
    benefits: ['Health insurance', 'Mentorship program', 'Learning budget'],
    status: 'active',
  },
  {
    title: 'Frontend Developer',
    level: 'Mid-level',
    location: 'Chicago, IL',
    type: 'Full-time',
    remote: true,
    description: 'Build beautiful and responsive user interfaces for our healthcare platform.',
    requirements: ['3+ years of experience', 'React, TypeScript', 'UI/UX experience'],
    compensation: { min: 90000, max: 120000, currency: 'USD' },
    benefits: ['Health insurance', 'Remote work', 'Stock options'],
    status: 'active',
  },
];

async function seedSampleData() {
  try {
    const firestore = getFirestore();
    console.log('Starting to seed sample companies and jobs...');

    // Create organizations and jobs
    for (let i = 0; i < sampleCompanies.length; i++) {
      const company = sampleCompanies[i];
      const job = sampleJobs[i];

      // Create organization
      const orgRef = await firestore.collection('organizations').add({
        ...company,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });

      console.log(`Created organization: ${company.name} (${orgRef.id})`);

      // Create a job for this organization
      await firestore.collection('jobs').add({
        ...job,
        orgId: orgRef.id,
        createdBy: 'seed-script',
        publishedAt: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });

      console.log(`Created job: ${job.title} for ${company.name}`);
    }

    console.log('\n✅ Successfully seeded sample data!');
    console.log(`Created ${sampleCompanies.length} organizations and ${sampleJobs.length} jobs`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedSampleData();
