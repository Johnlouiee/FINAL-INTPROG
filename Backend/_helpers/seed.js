const db = require('./db');

async function seed() {
    try {
        // Add test departments
        await db.Department.bulkCreate([
            {
                name: 'Human Resources',
                description: 'Manages employee relations and HR policies'
            },
            {
                name: 'Information Technology',
                description: 'Handles all IT infrastructure and support'
            },
            {
                name: 'Finance',
                description: 'Manages company finances and accounting'
            }
        ]);

        console.log('Test departments added successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

// Run the seed function
seed(); 