import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // We proxy CNN's internal API to bypass CORS and add the required User-Agent
    const response = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://edition.cnn.com/'
      },
      // It's good to cache this response briefly so we don't spam CNN on every page load
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from CNN: ${response.status}`);
    }

    const json = await response.json();
    const fngData = json.fear_and_greed;

    // Convert the CNN rating into the format the frontend expects (matching alternative.me schema)
    const convertRating = (rating: string) => {
      const formatted = rating.replace(/_/g, ' ').toLowerCase();
      if (formatted.includes('extreme fear')) return 'Extreme Fear';
      if (formatted.includes('extreme greed')) return 'Extreme Greed';
      if (formatted.includes('fear')) return 'Fear';
      if (formatted.includes('greed')) return 'Greed';
      return 'Neutral';
    };

    const finalValue = Math.round(fngData.score);
    const valueClassification = convertRating(fngData.rating);
    
    // Parse CNN timestamp into seconds
    const timestampSeconds = Math.floor(new Date(fngData.timestamp).getTime() / 1000).toString();

    // The component expects this specific alternative.me JSON shape
    return NextResponse.json({
      name: "Fear and Greed Index (CNN Data)",
      data: [
        {
          value: finalValue.toString(),
          value_classification: valueClassification,
          timestamp: timestampSeconds,
          time_until_update: "300" // Indicating 5 min update logic
        }
      ],
      metadata: {
        error: null
      }
    });

  } catch (error) {
    console.error("FNG Scraper Error:", error);
    // Fallback if CNN blocks the request temporarily
    return NextResponse.json({
      name: "Fear and Greed Index (Fallback)",
      data: [
        {
          value: "50",
          value_classification: "Neutral",
          timestamp: Math.floor(Date.now() / 1000).toString(),
          time_until_update: "300"
        }
      ],
      metadata: {
        error: "Fallback active"
      }
    });
  }
}
