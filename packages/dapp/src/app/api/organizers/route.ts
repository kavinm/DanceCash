import { NextRequest } from 'next/server';
import { getOrganizersCollection } from '@/models/CollectionAccess';
import { Organizer } from '@/models/index';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const organizersCollection = await getOrganizersCollection();

    // If ID is provided, return a single organizer
    if (id) {
      const organizer = await organizersCollection.findOne({ _id: new ObjectId(id) });
      if (!organizer) {
        return Response.json({ error: 'Organizer not found' }, { status: 404 });
      }
      
      return Response.json(organizer);
    }
    
    // Otherwise return a list of organizers with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query: any = { verified: true }; // Only return verified organizers
    
    const total = await organizersCollection.countDocuments(query);
    const organizers = await organizersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    return Response.json({
      organizers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching organizers:', error);
    return Response.json({ error: 'Failed to fetch organizers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const organizersCollection = await getOrganizersCollection();
    
    const body = await request.json();
    const { name, email, organizationName, description, profileImage, phone, walletAddress } = body;
    
    // Validate required fields
    if (!name || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create new organizer profile
    const newOrganizer: Organizer = {
      userId: email, // Using email as unique ID for now
      name,
      email,
      organizationName: organizationName || '',
      description: description || '',
      profileImage: profileImage || '',
      phone: phone || '',
      walletAddress: walletAddress || '',
      role: 'organizer',
      verified: false, // Needs verification
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await organizersCollection.insertOne(newOrganizer);
    
    return Response.json({ 
      message: 'Organizer profile created successfully', 
      organizerId: result.insertedId.toString(),
      organizer: { ...newOrganizer, _id: result.insertedId } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating organizer:', error);
    return Response.json({ error: 'Failed to create organizer profile' }, { status: 500 });
  }
}