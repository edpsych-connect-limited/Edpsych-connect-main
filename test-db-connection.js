/**
 * Test database connection using environment variables
 */
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.txt
const envPath = path.join(__dirname, '.env.txt');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)="?([^"]*)"?$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

async function testDatabaseConnection() {
  console.log('\n🔍 TESTING DATABASE CONNECTION\n');
  console.log('=' .repeat(60));

  // Check environment variables
  console.log('\n📋 Environment Variables Check:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
  console.log('REDIS_URL:', process.env.REDIS_URL ? '✅ Set' : '❌ Missing');
  console.log('NEO4J_URI:', process.env.NEO4J_URI ? '✅ Set' : '❌ Missing');

  // Test PostgreSQL Connection
  console.log('\n\n🔌 Testing PostgreSQL Connection...');
  console.log('-'.repeat(60));

  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not set');
  } else {
    // Extract connection details
    const dbUrl = process.env.DATABASE_URL;
    console.log('Database URL:', dbUrl.replace(/:[^:@]+@/, ':****@')); // Hide password

    // Check if it's internal URL
    if (dbUrl.includes('.railway.internal')) {
      console.log('⚠️  WARNING: Using Railway INTERNAL URL');
      console.log('⚠️  This will NOT work from Vercel!');
      console.log('⚠️  You need the PUBLIC Railway URL');
    } else if (dbUrl.includes('.railway.app')) {
      console.log('✅ Using Railway PUBLIC URL (correct for Vercel)');
    } else if (dbUrl.includes('postgres.vercel-storage.com')) {
      console.log('✅ Using Vercel Postgres (correct)');
    }

    // Try to connect
    try {
      const { Client } = require('pg');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
      });

      console.log('Attempting connection...');
      await client.connect();
      console.log('✅ PostgreSQL connection successful!');

      const result = await client.query('SELECT NOW()');
      console.log('✅ Query successful:', result.rows[0].now);

      await client.end();
    } catch (error) {
      console.log('❌ PostgreSQL connection failed:', error.message);
      if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
        console.log('⚠️  This suggests the database URL is not reachable from this machine');
        console.log('⚠️  If using Railway internal URL, get the PUBLIC URL instead');
      }
    }
  }

  // Test MongoDB Connection
  console.log('\n\n🍃 Testing MongoDB Connection...');
  console.log('-'.repeat(60));

  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI not set');
  } else {
    const mongoUrl = process.env.MONGODB_URI;
    console.log('MongoDB URL:', mongoUrl.replace(/:[^:@]+@/, ':****@'));

    if (mongoUrl.includes('.railway.internal')) {
      console.log('⚠️  WARNING: Using Railway INTERNAL URL');
      console.log('⚠️  This will NOT work from Vercel!');
    }

    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log('Attempting connection...');
      await client.connect();
      console.log('✅ MongoDB connection successful!');

      await client.close();
    } catch (error) {
      console.log('❌ MongoDB connection failed:', error.message);
    }
  }

  // Test Redis Connection
  console.log('\n\n🔴 Testing Redis Connection...');
  console.log('-'.repeat(60));

  if (!process.env.REDIS_URL) {
    console.log('❌ REDIS_URL not set');
  } else {
    const redisUrl = process.env.REDIS_URL;
    console.log('Redis URL:', redisUrl.replace(/:[^:@]+@/, ':****@'));

    if (redisUrl.includes('.railway.internal')) {
      console.log('⚠️  WARNING: Using Railway INTERNAL URL');
      console.log('⚠️  This will NOT work from Vercel!');
    }

    try {
      const redis = require('redis');
      const client = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000
        }
      });

      console.log('Attempting connection...');
      await client.connect();
      console.log('✅ Redis connection successful!');

      await client.ping();
      console.log('✅ Ping successful!');

      await client.quit();
    } catch (error) {
      console.log('❌ Redis connection failed:', error.message);
    }
  }

  // Summary
  console.log('\n\n📊 SUMMARY');
  console.log('='.repeat(60));
  console.log('\nNext Steps:');
  console.log('1. If any connection shows "railway.internal" - GET PUBLIC URLS');
  console.log('2. Update your environment variables in Vercel with PUBLIC URLs');
  console.log('3. Redeploy your application');
  console.log('\nTo get Railway public URLs:');
  console.log('- Go to https://railway.app/dashboard');
  console.log('- Click each service');
  console.log('- Settings → Networking → Enable Public Networking');
  console.log('- Copy the public URL (ends with .railway.app)');
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run the test
testDatabaseConnection().catch(console.error);
