import pool from '../../config/database';
import bcrypt from 'bcrypt';

async function seedDevData() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Seeding development data...');

    // Hash password for all users
    const passwordHash = await bcrypt.hash('password123', 12);

    // Insert sample orgs
    const orgResult = await client.query(`
      INSERT INTO orgs (id, name, website, logo_url)
      VALUES 
        ('11111111-1111-1111-1111-111111111111', 'TechCorp Inc', 'https://techcorp.example.com', 'https://via.placeholder.com/150'),
        ('22222222-2222-2222-2222-222222222222', 'StartupHub', 'https://startuphub.example.com', 'https://via.placeholder.com/150'),
        ('33333333-3333-3333-3333-333333333333', 'InnovateLabs', 'https://innovatelabs.example.com', 'https://via.placeholder.com/150')
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `);
    console.log(`✓ Inserted ${orgResult.rowCount} organizations`);

    // Insert sample users
    const userResult = await client.query(`
      INSERT INTO users (id, email, password_hash, role, name, avatar_url)
      VALUES 
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'candidate1@example.com', $1, 'candidate', 'Alice Johnson', 'https://i.pravatar.cc/150?img=1'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'candidate2@example.com', $1, 'candidate', 'Bob Smith', 'https://i.pravatar.cc/150?img=2'),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'candidate3@example.com', $1, 'candidate', 'Carol Williams', 'https://i.pravatar.cc/150?img=3'),
        ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'recruiter1@example.com', $1, 'recruiter', 'David Brown', 'https://i.pravatar.cc/150?img=4'),
        ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'recruiter2@example.com', $1, 'recruiter', 'Emma Davis', 'https://i.pravatar.cc/150?img=5'),
        ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'admin@example.com', $1, 'admin', 'Admin User', 'https://i.pravatar.cc/150?img=6')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [passwordHash]);
    console.log(`✓ Inserted ${userResult.rowCount} users`);

    // Insert candidate profiles
    const candidateProfileResult = await client.query(`
      INSERT INTO candidate_profiles (user_id, location, skills, experience, education, preferences)
      VALUES 
        (
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          'San Francisco, CA',
          ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
          '[
            {
              "company": "Tech Solutions Inc",
              "title": "Senior Software Engineer",
              "startDate": "2020-01-15",
              "endDate": "2024-10-01",
              "description": "Led development of customer-facing web applications using React and Node.js"
            },
            {
              "company": "StartupXYZ",
              "title": "Full Stack Developer",
              "startDate": "2018-06-01",
              "endDate": "2019-12-31",
              "description": "Built and maintained full-stack applications with modern JavaScript frameworks"
            }
          ]'::jsonb,
          '[
            {
              "institution": "University of California, Berkeley",
              "degree": "Bachelor of Science",
              "field": "Computer Science",
              "graduationDate": "2018-05-15"
            }
          ]'::jsonb,
          '{
            "roles": ["Software Engineer", "Full Stack Developer"],
            "locations": ["San Francisco, CA", "Remote"],
            "remoteOnly": false,
            "minCompensation": 120000
          }'::jsonb
        ),
        (
          'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          'New York, NY',
          ARRAY['Python', 'Django', 'Machine Learning', 'AWS', 'Docker'],
          '[
            {
              "company": "DataCorp",
              "title": "ML Engineer",
              "startDate": "2021-03-01",
              "description": "Developed machine learning models for predictive analytics"
            }
          ]'::jsonb,
          '[
            {
              "institution": "MIT",
              "degree": "Master of Science",
              "field": "Artificial Intelligence",
              "graduationDate": "2021-05-20"
            }
          ]'::jsonb,
          '{
            "roles": ["ML Engineer", "Data Scientist"],
            "locations": ["New York, NY", "Remote"],
            "remoteOnly": true,
            "minCompensation": 150000
          }'::jsonb
        ),
        (
          'cccccccc-cccc-cccc-cccc-cccccccccccc',
          'Austin, TX',
          ARRAY['Java', 'Spring Boot', 'Kubernetes', 'Microservices'],
          '[
            {
              "company": "Enterprise Solutions",
              "title": "Backend Developer",
              "startDate": "2019-08-01",
              "description": "Built scalable microservices architecture"
            }
          ]'::jsonb,
          '[
            {
              "institution": "University of Texas at Austin",
              "degree": "Bachelor of Science",
              "field": "Software Engineering",
              "graduationDate": "2019-05-15"
            }
          ]'::jsonb,
          '{
            "roles": ["Backend Developer", "Software Engineer"],
            "locations": ["Austin, TX"],
            "remoteOnly": false,
            "minCompensation": 100000
          }'::jsonb
        )
      ON CONFLICT (user_id) DO NOTHING
      RETURNING user_id
    `);
    console.log(`✓ Inserted ${candidateProfileResult.rowCount} candidate profiles`);

    // Insert recruiter profiles
    const recruiterProfileResult = await client.query(`
      INSERT INTO recruiter_profiles (user_id, org_id, title)
      VALUES 
        ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Senior Technical Recruiter'),
        ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Talent Acquisition Manager')
      ON CONFLICT (user_id) DO NOTHING
      RETURNING user_id
    `);
    console.log(`✓ Inserted ${recruiterProfileResult.rowCount} recruiter profiles`);

    // Insert sample jobs
    const jobResult = await client.query(`
      INSERT INTO jobs (id, org_id, created_by, title, level, location, type, remote, description, requirements, compensation, benefits, status, published_at)
      VALUES 
        (
          '10000000-0000-0000-0000-000000000001',
          '11111111-1111-1111-1111-111111111111',
          'dddddddd-dddd-dddd-dddd-dddddddddddd',
          'Senior Full Stack Engineer',
          'senior',
          'San Francisco, CA',
          'full-time',
          true,
          'We are looking for an experienced Full Stack Engineer to join our growing team. You will work on building scalable web applications using modern technologies.',
          ARRAY['5+ years of experience with JavaScript/TypeScript', 'Strong knowledge of React and Node.js', 'Experience with PostgreSQL or similar databases', 'Excellent problem-solving skills'],
          '{"min": 140000, "max": 180000, "currency": "USD", "equity": "0.1-0.5%"}'::jsonb,
          ARRAY['Health insurance', 'Dental and vision', '401k matching', 'Unlimited PTO', 'Remote work options'],
          'active',
          NOW()
        ),
        (
          '10000000-0000-0000-0000-000000000002',
          '22222222-2222-2222-2222-222222222222',
          'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
          'Machine Learning Engineer',
          'mid',
          'Remote',
          'full-time',
          true,
          'Join our AI team to build cutting-edge machine learning models. You will work on exciting projects involving NLP, computer vision, and predictive analytics.',
          ARRAY['3+ years of ML experience', 'Strong Python skills', 'Experience with TensorFlow or PyTorch', 'Understanding of MLOps practices'],
          '{"min": 130000, "max": 160000, "currency": "USD", "equity": "0.2-0.8%"}'::jsonb,
          ARRAY['Health insurance', 'Remote-first culture', 'Learning budget', 'Stock options'],
          'active',
          NOW()
        ),
        (
          '10000000-0000-0000-0000-000000000003',
          '11111111-1111-1111-1111-111111111111',
          'dddddddd-dddd-dddd-dddd-dddddddddddd',
          'Frontend Developer',
          'mid',
          'New York, NY',
          'full-time',
          false,
          'We need a talented Frontend Developer to create beautiful and responsive user interfaces. You will collaborate with designers and backend engineers.',
          ARRAY['3+ years of frontend development', 'Expert in React and modern CSS', 'Experience with TypeScript', 'Strong attention to detail'],
          '{"min": 110000, "max": 140000, "currency": "USD"}'::jsonb,
          ARRAY['Health insurance', 'Commuter benefits', 'Gym membership', 'Catered lunches'],
          'active',
          NOW()
        ),
        (
          '10000000-0000-0000-0000-000000000004',
          '33333333-3333-3333-3333-333333333333',
          'dddddddd-dddd-dddd-dddd-dddddddddddd',
          'DevOps Engineer',
          'senior',
          'Austin, TX',
          'full-time',
          true,
          'Looking for a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. You will ensure high availability and scalability.',
          ARRAY['5+ years of DevOps experience', 'Strong knowledge of AWS or GCP', 'Experience with Kubernetes and Docker', 'Infrastructure as Code (Terraform)'],
          '{"min": 135000, "max": 170000, "currency": "USD"}'::jsonb,
          ARRAY['Health insurance', 'Remote work', '401k', 'Professional development'],
          'active',
          NOW()
        ),
        (
          '10000000-0000-0000-0000-000000000005',
          '22222222-2222-2222-2222-222222222222',
          'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
          'Junior Software Engineer',
          'entry',
          'Remote',
          'full-time',
          true,
          'Great opportunity for recent graduates or early-career developers. You will learn from experienced engineers and contribute to real projects.',
          ARRAY['Bachelor degree in CS or related field', 'Knowledge of at least one programming language', 'Eagerness to learn', 'Good communication skills'],
          '{"min": 70000, "max": 90000, "currency": "USD"}'::jsonb,
          ARRAY['Health insurance', 'Mentorship program', 'Remote work', 'Learning resources'],
          'active',
          NOW()
        ),
        (
          '10000000-0000-0000-0000-000000000006',
          '11111111-1111-1111-1111-111111111111',
          'dddddddd-dddd-dddd-dddd-dddddddddddd',
          'Product Manager',
          'lead',
          'San Francisco, CA',
          'full-time',
          false,
          'We are seeking an experienced Product Manager to lead our product strategy and roadmap. You will work closely with engineering and design teams.',
          ARRAY['7+ years of product management experience', 'Strong technical background', 'Excellent communication skills', 'Data-driven decision making'],
          '{"min": 160000, "max": 200000, "currency": "USD", "equity": "0.5-1%"}'::jsonb,
          ARRAY['Health insurance', 'Equity', 'Unlimited PTO', 'Executive coaching'],
          'active',
          NOW()
        )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `);
    console.log(`✓ Inserted ${jobResult.rowCount} jobs`);

    await client.query('COMMIT');
    console.log('\n✅ Development data seeded successfully!');
    console.log('\nTest credentials:');
    console.log('  Candidate: candidate1@example.com / password123');
    console.log('  Recruiter: recruiter1@example.com / password123');
    console.log('  Admin: admin@example.com / password123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedDevData()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export default seedDevData;
