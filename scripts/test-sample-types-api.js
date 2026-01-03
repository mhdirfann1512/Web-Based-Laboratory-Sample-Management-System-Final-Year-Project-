
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
            
            await connection.execute(`
                CREATE TABLE sample_types (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            console.log('✅ sample_types table created');
            
            // Insert sample data
            const sampleTypes = [
                'Blood', 'Tissue', 'Urine', 'Saliva', 'Serum', 
                'Plasma', 'CSF', 'Biopsy', 'Stool', 'Other'
            ];
            
            for (const type of sampleTypes) {
                await connection.execute(
                    'INSERT INTO sample_types (name, description) VALUES (?, ?)',
                    [type, `${type} sample for laboratory testing`]
                );
            }
            
            console.log('✅ Sample data inserted');
        }
        
        // Check sample types data
        const [rows] = await connection.execute('SELECT * FROM sample_types');
        console.log(`📊 Found ${rows.length} sample types in database:`);
        rows.forEach(row => {
            console.log(`   - ID: ${row.id}, Name: ${row.name}`);
        });
        
        await connection.end();
        
        // Test the API endpoint
        console.log('\n🌐 Testing API endpoint...');
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
