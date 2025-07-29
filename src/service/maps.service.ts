import axios from 'axios';
import Driver from '../models/driver/driver.model';

export const getAddressCoordinates = async (address: string): Promise<{ lat: number; lng: number }> => {
    try {
        const response = await axios.get<{
            lat: string;
            lon: string;
        }[]>(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: address,
                format: 'json',
                limit: 1,
            },
        });

        if (!response.data.length) throw new Error('No results found');

        const location = response.data[0];
        return { lat: parseFloat(location.lat), lng: parseFloat(location.lon) };
    } catch (error) {
        console.error('Nominatim error:', error);
        throw error;
    }
};


export const getDistanceAndTime = async (
    origin: string,
    destination: string
): Promise<{ distance: string; duration: string }> => {
    try {
        const apiKey = process.env.ORS_API_KEY;
        if (!apiKey) throw new Error('OpenRouteService API key not defined');

        const originCoords = await getAddressCoordinates(origin);
        const destCoords = await getAddressCoordinates(destination);

        const response = await axios.post<{
            distances: number[][];
            durations: number[][];
        }>(`https://api.openrouteservice.org/v2/matrix/driving-car`, {
            locations: [
                [originCoords.lng, originCoords.lat],
                [destCoords.lng, destCoords.lat],
            ],
            metrics: ['distance', 'duration'],
        }, {
            headers: {
                Authorization: apiKey,
                'Content-Type': 'application/json',
            },
        });

        const distance = response.data.distances[0][1]; // in meters
        const duration = response.data.durations[0][1]; // in seconds

        return {
            distance: `${(distance / 1000).toFixed(2)} km`,
            duration: `${Math.round(duration / 60)} mins`,
        };
    } catch (error) {
        console.error('ORS distance matrix error:', error);
        throw error;
    }
};


export const getAutoCompleteSuggestions = async (input: string): Promise<string[]> => {
    try {
        const response = await axios.get<{ features: { properties: { name: string } }[] }>(
            `https://photon.komoot.io/api/`,
            {
                params: {
                    q: input,
                    limit: 5,
                },
            }
        );

        return response.data.features.map(f => f.properties.name);
    } catch (error) {
        console.error('Photon autocomplete error:', error);
        throw error;
    }
};

export const getRiderInRadius = async (ltd: number, lng: number, radius: number): Promise<any[]> => {
    try {
        const riders = await Driver.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[lng, ltd], radius / 6378.1] // radius in kilometers
                }
            }
        })

        return riders;
    } catch (error) {
        console.error('Error fetching riders in radius:', error);
        throw error;
    }
}