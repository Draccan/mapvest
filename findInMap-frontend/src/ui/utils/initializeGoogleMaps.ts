import { GOOGLE_MAPS_API_KEY } from "../../config";

const initializeGoogleMaps = async () => {
    if (!GOOGLE_MAPS_API_KEY) {
        console.warn("Google Maps API key not found.");
        return;
    }

    try {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
        script.async = true;
        script.id = "google-maps-script";

        script.onerror = () => {
            console.error("Google Maps API failed to load");
        };

        document.head.appendChild(script);
    } catch (error: unknown) {
        console.error("Google Maps failed to initialize:", error);
    }
};

export default initializeGoogleMaps;
