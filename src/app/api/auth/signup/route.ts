import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, organization, role, phone } = body;

    // 1. Basic Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create Tenant (Organization)
    // Every user must belong to a tenant. If organization name is provided, use it.
    // Otherwise, create a personal tenant.
    const tenantName = organization || `${firstName} ${lastName}'s Workspace`;
    
    // Generate a unique subdomain
    const baseSlug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const subdomain = `${baseSlug}-${uniqueSuffix}`;

    // Transaction to ensure both tenant and user are created or neither
    const result = await prisma.$transaction(async (tx) => {
      // Create Tenant
      const newTenant = await tx.tenants.create({
        data: {
          name: tenantName,
          subdomain: subdomain,
          tenant_type: organization ? 'SCHOOL' : 'EP_INDEPENDENT', // Default types
          status: 'active',
          contact_email: email,
          contact_phone: phone,
        },
      });

      // Create User
      const newUser = await tx.users.create({
        data: {
          email,
          password_hash: passwordHash,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          role,
          tenant_id: newTenant.id,
          is_active: true,
          onboarding_completed: false,
          onboarding_step: 0,
        },
      });

      return newUser;
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
