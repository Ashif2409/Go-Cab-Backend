import axios from 'axios';

export const getAddressCoordinates = async (address: string): Promise<{ lat: number; lng: number }> => {
    try {
        const apiKey = process.env.GOOGLE_MAP_API;
        if (!apiKey) throw new Error('Google Maps API key is not defined');

        const response = await axios.get<{
            status: string;
            results: { geometry: { location: { lat: number; lng: number } } }[];
        }>(`https://maps.googleapis.com/maps/api/geocode/json`, {
            params: { address, key: apiKey },
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Geocoding API error: ${response.data.status}`);
        }

        const location = response.data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };

    } catch (error) {
        console.error('Error fetching address coordinates:', error);
        throw error;
    }
};

export const getDistanceAndTime = async (
    origin: string,
    destination: string
): Promise<{ distance: string; duration: string }> => {
    try {
        const apiKey = process.env.GOOGLE_MAP_API;
        if (!apiKey) throw new Error('Google Maps API key is not defined');

        const response = await axios.get<{
            rows: { elements: { status: string; distance: { text: string }; duration: { text: string } }[] }[];
        }>(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
            params: {
                origins: origin,
                destinations: destination,
                key: apiKey,
            },
        });

        const element = response.data?.rows?.[0]?.elements?.[0];

        if (!element || element.status !== 'OK') {
            throw new Error(`Distance Matrix API error: ${element?.status || 'Unknown'}`);
        }

        return {
            distance: element.distance.text,
            duration: element.duration.text,
        };

    } catch (error) {
        console.error('Error fetching distance and time:', error);
        throw error;
    }
};

export const getAutoCompleteSuggestions = async (input: string): Promise<string[]> => {
    try {
        const apiKey = process.env.GOOGLE_MAP_API;
        if (!apiKey) throw new Error('Google Maps API key is not defined');
        const response = await axios.get<{
            predictions: { description: string }[];
        }>(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
            params: {
                input,
                key: apiKey,
            },
        });
        if (response.data.predictions.length === 0) {
            return [];
        }
        return response.data.predictions.map(prediction => prediction.description);
    } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        throw error;
    }
}