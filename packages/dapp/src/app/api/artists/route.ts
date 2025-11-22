import { NextRequest } from 'next/server';
import { getArtistsCollection } from '@/models/CollectionAccess';
import { Artist } from '@/models/index';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const danceStyle = searchParams.get('danceStyle');
    const city = searchParams.get('city');

    const artistsCollection = await getArtistsCollection();

    // If ID is provided, return a single artist
    if (id) {
      const artist = await artistsCollection.findOne({ _id: new ObjectId(id) });
      if (!artist) {
        return Response.json({ error: 'Artist not found' }, { status: 404 });
      }
      
      return Response.json(artist);
    }
    
    // Otherwise return a list of artists with pagination and filters
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query: any = { verified: true }; // Only return verified artists
    
    if (danceStyle) query.danceStyles = { $in: [new RegExp(danceStyle, 'i')] };
    if (city) query.location = { $regex: new RegExp(city, 'i') };
    
    const total = await artistsCollection.countDocuments(query);
    const artists = await artistsCollection
      .find(query)
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    return Response.json({
      artists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    return Response.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const artistsCollection = await getArtistsCollection();
    
    const body = await request.json();
    const { name, email, bio, socialLinks, profileImage, danceStyles, experienceYears, phone, walletAddress } = body;
    
    // Validate required fields
    if (!name || !email || !danceStyles || !experienceYears) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create new artist profile
    const newArtist: Artist = {
      userId: email, // Using email as unique ID for now
      name,
      email,
      bio: bio || '',
      socialLinks: socialLinks || [],
      profileImage: profileImage || '',
      danceStyles: Array.isArray(danceStyles) ? danceStyles : [danceStyles],
      experienceYears: parseInt(experienceYears),
      phone: phone || '',
      walletAddress: walletAddress || '',
      role: 'artist',
      verified: false, // Needs verification
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await artistsCollection.insertOne(newArtist);
    
    return Response.json({ 
      message: 'Artist profile created successfully', 
      artistId: result.insertedId.toString(),
      artist: { ...newArtist, _id: result.insertedId } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating artist:', error);
    return Response.json({ error: 'Failed to create artist profile' }, { status: 500 });
  }
}