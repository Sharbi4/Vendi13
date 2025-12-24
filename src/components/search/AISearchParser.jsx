import { base44 } from '@/api/base44Client';

/**
 * Parse natural language search query using AI
 * Returns structured search parameters
 */
export async function parseNaturalLanguageSearch(query) {
  if (!query || query.trim().length < 3) {
    return null;
  }

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Parse this search query for a food truck/trailer/ghost kitchen rental marketplace and extract structured search parameters.

Search query: "${query}"

Extract and return JSON with these fields (use null if not mentioned):
- mode: "rent" or "sale" or null
- category: "food_truck", "food_trailer", "ghost_kitchen", "equipment", or null
- location: city/state string or null
- dateRange: {start: "YYYY-MM-DD", end: "YYYY-MM-DD"} or null
- priceRange: {min: number, max: number} or null
- filters: {
    delivery: boolean or null,
    waterHookup: boolean or null,
    verified: boolean or null,
    instantBook: boolean or null,
    powerType: "electric"/"gas"/"generator" or null
  }
- amenities: array of strings or []

Examples:
"food trucks next week in Austin" -> {mode: "rent", category: "food_truck", location: "Austin, TX", dateRange: {...}, filters: {}, amenities: []}
"buy a trailer with AC in Phoenix" -> {mode: "sale", category: "food_trailer", location: "Phoenix, AZ", filters: {}, amenities: ["air conditioning"]}
"ghost kitchen with water hookup under $200/day" -> {mode: "rent", category: "ghost_kitchen", priceRange: {min: null, max: 200}, filters: {waterHookup: true}, amenities: []}`,
      response_json_schema: {
        type: "object",
        properties: {
          mode: { type: ["string", "null"] },
          category: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          dateRange: {
            type: ["object", "null"],
            properties: {
              start: { type: "string" },
              end: { type: "string" }
            }
          },
          priceRange: {
            type: ["object", "null"],
            properties: {
              min: { type: ["number", "null"] },
              max: { type: ["number", "null"] }
            }
          },
          filters: {
            type: "object",
            properties: {
              delivery: { type: ["boolean", "null"] },
              waterHookup: { type: ["boolean", "null"] },
              verified: { type: ["boolean", "null"] },
              instantBook: { type: ["boolean", "null"] },
              powerType: { type: ["string", "null"] }
            }
          },
          amenities: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return result;
  } catch (error) {
    console.error('AI search parsing error:', error);
    return null;
  }
}

/**
 * Generate search recommendations based on user history
 */
export async function generateSearchRecommendations(userEmail, viewHistory = [], savedSearches = []) {
  if (!viewHistory?.length && !savedSearches?.length) {
    return [];
  }

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this user's search and viewing history, suggest 3-4 relevant search queries they might be interested in.

User's viewed listings: ${JSON.stringify(viewHistory.slice(0, 10))}
User's saved searches: ${JSON.stringify(savedSearches.slice(0, 5))}

Return an array of natural language search suggestions that are relevant, specific, and actionable.
Examples: "Food trucks with AC in Austin", "Ghost kitchens under $150/day", "Verified trailers available this weekend"`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 4
          }
        }
      }
    });

    return result.suggestions || [];
  } catch (error) {
    console.error('AI recommendations error:', error);
    return [];
  }
}