/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

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
    const { user: newUser, tenant: newTenant } = await prisma.$transaction(async (tx) => {
      // Create Tenant
      const tenant = await tx.tenants.create({
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
      const user = await tx.users.create({
        data: {
          email,
          password_hash: passwordHash,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          role,
          tenant_id: tenant.id,
          is_active: true,
          onboarding_completed: false,
          onboarding_step: 0,
        },
      });

      return { user, tenant };
    });

    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('NEXTAUTH_SECRET is not configured');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Generate Tokens
    const accessToken = sign(
      {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        tenantId: newUser.tenant_id,
        permissions: newUser.permissions,
      },
      jwtSecret,
      { expiresIn: '1d' }
    );

    const refreshToken = sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const userData = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      permissions: newUser.permissions,
      tenantId: newUser.tenant_id,
      tenant: {
        id: newTenant.id,
        name: newTenant.name,
        subdomain: newTenant.subdomain,
        tenantType: newTenant.tenant_type,
      },
      isEmailVerified: newUser.isEmailVerified,
      onboardingCompleted: newUser.onboarding_completed,
      onboardingSkipped: newUser.onboarding_skipped,
      professional: null,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        accessToken,
        refreshToken,
      },
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
