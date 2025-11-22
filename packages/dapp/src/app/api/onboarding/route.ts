import { NextRequest } from 'next/server';
import { getUsersCollection, getOrganizersCollection, getArtistsCollection } from '@/models/CollectionAccess';
import { User, Organizer, Artist } from '@/models/index';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const usersCollection = await getUsersCollection();
    const organizersCollection = await getOrganizersCollection();
    const artistsCollection = await getArtistsCollection();
    
    const body = await request.json();
    const { userId, name, email, phone, walletAddress, role, profileData } = body;
    
    // Validate required fields
    if (!userId || !name || !email || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user already exists
    let existingUser = await usersCollection.findOne({ userId });
    
    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 409 });
    }
    
    // Create the base user
    const newUser: User = {
      userId,
      name,
      email,
      phone: phone || '',
      role: role as 'dancer' | 'artist' | 'organizer',
      walletAddress: walletAddress || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const userResult = await usersCollection.insertOne(newUser);
    
    // If the user is an artist or organizer, create the extended profile
    if (role === 'artist') {
      const newArtist: Artist = {
        ...newUser,
        bio: profileData?.bio || '',
        socialLinks: profileData?.socialLinks || [],
        profileImage: profileData?.profileImage || '',
        danceStyles: profileData?.danceStyles || [],
        experienceYears: profileData?.experienceYears || 0,
        rating: profileData?.rating || 0,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await artistsCollection.insertOne(newArtist);
    } else if (role === 'organizer') {
      const newOrganizer: Organizer = {
        ...newUser,
        organizationName: profileData?.organizationName || '',
        businessLicense: profileData?.businessLicense || '',
        description: profileData?.description || '',
        profileImage: profileData?.profileImage || '',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await organizersCollection.insertOne(newOrganizer);
    }
    
    return Response.json({ 
      message: `User profile created successfully as ${role}`, 
      userId: userResult.insertedId.toString(),
      user: { ...newUser, _id: userResult.insertedId } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in onboarding:', error);
    return Response.json({ error: 'Failed to onboard user' }, { status: 500 });
  }
}