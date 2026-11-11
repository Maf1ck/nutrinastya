import { seedIfEmpty } from './seed.ts'

const seeded = seedIfEmpty()
console.log(seeded ? 'Demo data created.' : 'Database is not empty — nothing seeded.')
