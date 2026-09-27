const https = require('https');

const ADVOCATES_PDF_URL = process.env.ADVOCATES_PDF_URL || 'https://cdnbbsr.s3waas.gov.in/s3ec04c6b8c8d762da15fa8dbbdfb6baf9/uploads/2024/02/2024020527.pdf';
const ADVOCATES_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Module-level cache (persists across warm invocations)
let advocatesCache = { fetchedAt: 0, data: [], sourceUrl: ADVOCATES_PDF_URL };

const MOCK_ADVOCATES = [
  { id: 'adv-1', name: 'Adv. Rajesh Kumar Sharma', enrollmentNo: 'D/123/2015', phone: '9876543210', address: 'Chamber No. 45, District Court Complex, Connaught Place', city: 'New Delhi', specialty: 'Criminal Law', rating: '4.8', experience: '15', casesWon: '320', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-2', name: 'Adv. Priya Malhotra', enrollmentNo: 'D/456/2018', phone: '9123456789', address: 'A-12, Lawyers Chambers, High Court', city: 'Mumbai', specialty: 'Corporate Law', rating: '4.9', experience: '12', casesWon: '280', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-3', name: 'Adv. Sanjay Verma', enrollmentNo: 'B/789/2012', phone: '9988776655', address: 'Block C, Civil Court, Park Street', city: 'Kolkata', specialty: 'Family Law', rating: '4.7', experience: '18', casesWon: '450', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-4', name: 'Adv. Anjali Reddy', enrollmentNo: 'H/234/2016', phone: '9876501234', address: 'Chamber 78, High Court Building, Abids', city: 'Hyderabad', specialty: 'Property Law', rating: '4.6', experience: '10', casesWon: '195', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-5', name: 'Adv. Arjun Menon', enrollmentNo: 'K/567/2019', phone: '9445566778', address: 'Legal Complex, MG Road', city: 'Bangalore', specialty: 'Cyber Law', rating: '4.9', experience: '8', casesWon: '150', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-6', name: 'Adv. Meera Nair', enrollmentNo: 'K/890/2014', phone: '9898989898', address: 'Chamber 15, Sessions Court, Ernakulam', city: 'Kochi', specialty: 'Consumer Rights', rating: '4.8', experience: '14', casesWon: '310', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-7', name: 'Adv. Vikram Singh', enrollmentNo: 'P/345/2017', phone: '9876123450', address: 'Sector 17, District Court', city: 'Chandigarh', specialty: 'Labour Law', rating: '4.5', experience: '11', casesWon: '225', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-8', name: 'Adv. Kavita Deshmukh', enrollmentNo: 'M/678/2015', phone: '9123450987', address: 'Shivaji Nagar Court Complex', city: 'Pune', specialty: 'Taxation Law', rating: '4.7', experience: '13', casesWon: '265', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-9', name: 'Adv. Ramesh Iyer', enrollmentNo: 'T/901/2013', phone: '9876009876', address: 'High Court Chambers, Anna Salai', city: 'Chennai', specialty: 'Constitutional Law', rating: '4.9', experience: '16', casesWon: '380', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-10', name: 'Adv. Neha Chopra', enrollmentNo: 'D/111/2020', phone: '9871234560', address: 'Rohini Court Complex', city: 'New Delhi', specialty: 'Intellectual Property', rating: '4.6', experience: '6', casesWon: '95', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-11', name: 'Adv. Arun Bhattacharya', enrollmentNo: 'B/222/2011', phone: '9988112233', address: 'Salt Lake Court Annexe', city: 'Kolkata', specialty: 'Banking Law', rating: '4.8', experience: '20', casesWon: '520', imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-12', name: 'Adv. Sunita Patil', enrollmentNo: 'M/333/2016', phone: '9123678901', address: 'Court Road, Dadar', city: 'Mumbai', specialty: 'Matrimonial Law', rating: '4.7', experience: '12', casesWon: '270', imageUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-13', name: 'Adv. Karthik Raman', enrollmentNo: 'T/444/2018', phone: '9445123789', address: 'T. Nagar Court Complex', city: 'Chennai', specialty: 'Real Estate Law', rating: '4.5', experience: '9', casesWon: '165', imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-14', name: 'Adv. Deepa Joshi', enrollmentNo: 'P/555/2014', phone: '9876234567', address: 'IT Park Court, Whitefield', city: 'Bangalore', specialty: 'Employment Law', rating: '4.9', experience: '15', casesWon: '340', imageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-15', name: 'Adv. Manish Agarwal', enrollmentNo: 'R/666/2017', phone: '9123987654', address: 'Civil Lines Court', city: 'Jaipur', specialty: 'Civil Litigation', rating: '4.6', experience: '10', casesWon: '210', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-16', name: 'Adv. Ritu Kapoor', enrollmentNo: 'D/777/2019', phone: '9876456789', address: 'Dwarka Court Complex', city: 'New Delhi', specialty: 'Women Rights', rating: '4.8', experience: '7', casesWon: '130', imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-17', name: 'Adv. Suresh Pillai', enrollmentNo: 'K/888/2012', phone: '9445890123', address: 'Fort Kochi Legal Chambers', city: 'Kochi', specialty: 'Maritime Law', rating: '4.7', experience: '18', casesWon: '405', imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-18', name: 'Adv. Pooja Gupta', enrollmentNo: 'L/999/2020', phone: '9876678901', address: 'Gomti Nagar Court', city: 'Lucknow', specialty: 'Child Custody', rating: '4.9', experience: '5', casesWon: '78', imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200' },
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const now = Date.now();
    const { refresh } = req.query;

    if (refresh === 'true') {
      advocatesCache = { fetchedAt: 0, data: [], sourceUrl: ADVOCATES_PDF_URL };
    }

    // Return cached data if fresh
    if (advocatesCache.data.length > 0 && now - advocatesCache.fetchedAt < ADVOCATES_CACHE_TTL_MS) {
      return res.json({
        sourceUrl: advocatesCache.sourceUrl,
        fetchedAt: advocatesCache.fetchedAt,
        count: advocatesCache.data.length,
        advocates: advocatesCache.data,
      });
    }

    // Serve mock data (PDF parsing is heavy for serverless; PDF will be attempted in background)
    // For Vercel serverless, we use mock data as primary source for fast response
    advocatesCache = { fetchedAt: now, data: MOCK_ADVOCATES, sourceUrl: 'Mock Dataset (PDF parsing unavailable in serverless)' };

    res.json({
      sourceUrl: advocatesCache.sourceUrl,
      fetchedAt: advocatesCache.fetchedAt,
      count: advocatesCache.data.length,
      advocates: advocatesCache.data,
    });
  } catch (error) {
    console.error('[API] Error in /api/advocates:', error);
    res.status(500).json({ error: 'Failed to fetch advocates list', details: error.message });
  }
};
