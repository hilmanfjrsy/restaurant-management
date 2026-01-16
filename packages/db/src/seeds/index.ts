import { seedCustomers } from "./customers.seeds";
import { seedTables } from "./tables.seeds"

const runSeeds = async () => {
  console.log('Starting database seeding...');
  await Promise.all([
    seedTables(),
    seedCustomers(),
  ]);
}

runSeeds().then(() => {
  console.log('All seeding completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});