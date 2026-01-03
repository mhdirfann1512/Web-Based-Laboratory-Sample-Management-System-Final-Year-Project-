const fs = require("fs")
const path = require("path")

console.log("🔍 Debugging sample types loading issue...\n")

// Check if the API routes exist in app.js
const appPath = path.join(__dirname, "..", "app.js")
try {
  const appContent = fs.readFileSync(appPath, "utf8")

  console.log("📋 Checking API routes in app.js:")

  const routes = [
    "/api/sample-types",
    "/api/sample-tests",
    "/api/sample-storage",
    "/api/generate-sample-id",
    "/api/register-sample",
  ]

  routes.forEach((route) => {
    if (appContent.includes(route)) {
      console.log(`✅ ${route} - Found`)
    } else {
      console.log(`❌ ${route} - Missing`)
    }
  })
} catch (error) {
  console.log("❌ Could not read app.js file")
}

console.log("\n🔧 Creating test script to check database and API...\n")

// Create a test script to check the database
const testScript = `
const mysql = require('mysql2/promise');

async function testSampleTypesAPI() {
    console.log('🔍 Testing sample types database and API...');
    
    try {
        // Test database connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sample_storage'
        });
        
        console.log('✅ Database connection successful');
        
        // Check if sample_types table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'sample_types'");
        if (tables.length === 0) {
            console.log('❌ sample_types table does not exist');
            console.log('📝 Creating sample_types table...');
            
            await connection.execute(\`
                CREATE TABLE sample_types (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            \`);
            
            console.log('✅ sample_types table created');
            
            // Insert sample data
            const sampleTypes = [
                'Blood', 'Tissue', 'Urine', 'Saliva', 'Serum', 
                'Plasma', 'CSF', 'Biopsy', 'Stool', 'Other'
            ];
            
            for (const type of sampleTypes) {
                await connection.execute(
                    'INSERT INTO sample_types (name, description) VALUES (?, ?)',
                    [type, \`\${type} sample for laboratory testing\`]
                );
            }
            
            console.log('✅ Sample data inserted');
        }
        
        // Check sample types data
        const [rows] = await connection.execute('SELECT * FROM sample_types');
        console.log(\`📊 Found \${rows.length} sample types in database:\`);
        rows.forEach(row => {
            console.log(\`   - ID: \${row.id}, Name: \${row.name}\`);
        });
        
        await connection.end();
        
        // Test the API endpoint
        console.log('\\n🌐 Testing API endpoint...');
        const fetch = require('node-fetch');
        
        try {
            const response = await fetch('http://localhost:3000/api/sample-types');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API endpoint working');
                console.log('📋 API Response:', JSON.stringify(data, null, 2));
            } else {
                console.log('❌ API endpoint returned error:', response.status);
            }
        } catch (apiError) {
            console.log('❌ API endpoint not accessible:', apiError.message);
            console.log('💡 Make sure your server is running on port 3000');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testSampleTypesAPI();
`

fs.writeFileSync(path.join(__dirname, "test-sample-types-api.js"), testScript)

console.log("✅ Created test script: scripts/test-sample-types-api.js")
console.log("\n📋 Next steps:")
console.log("1. Run: node scripts/test-sample-types-api.js")
console.log("2. This will check your database and API endpoints")
console.log("3. If needed, it will create the sample_types table and add sample data")
console.log("\n🚀 After running the test, try refreshing your register sample page!")
