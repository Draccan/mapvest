import flattenObject from "../utils/flattenObject";

export default flattenObject({
    components: {
        MapContainer: {
            type: "Type",
            types: {
                THEFT: "Theft",
                AGGRESSION: "Aggression",
                ROBBERY: "Robbery",
            },
            date: "Date",
            coordinates: "Coordinates",
            selectedPoint: "Selected Point",
        },
        MapPointForm: {
            addMapPoint: "Add Map Point",
            XCoordinateLabel: "X Coordinate (Longitude)",
            YCoordinateLabel: "Y Coordinate (Latitude)",
            type: "Type",
            date: "Date",
            options: {
                theft: "Theft",
                aggression: "Aggression",
                robbery: "Robbery",
            },
            save: "Save Point",
            saving: "Saving...",
            clickOnMapInstructions: "Click on the map to select coordinates.",
        },
    },
    views: {
        About: {
            description: "Senior Software Engineer Freelance",
            viewLinkedIn: "View my LinkedIn Profile",
            backToMap: "Back to Map",
        },
        Home: {
            about: "About",
            logout: "Logout",
            loadingMapPoints: "Loading map points...",
        },
        Login: {
            emailLabel: "Email:",
            passwordLabel: "Password:",
            login: "Login",
            loading: "Logging in...",
            noAccount: "Don't have an account?",
            registerHere: "Register here",
        },
        NotFound: {
            title: "Oops! You're lost!",
            description: "It looks like you took a wrong turn.",
            description2: "This location hasn't been mapped yet!",
            backToMap: "Back to Map",
            footerMessage:
                "Don't worry, even the best explorers get lost sometimes!",
        },
        Register: {
            passwordsDoNotMatch: "Passwords do not match",
            nameLabel: "Name:",
            surnameLabel: "Surname:",
            emailLabel: "Email:",
            passwordLabel: "Password:",
            confirmPasswordLabel: "Confirm Password:",
            register: "Register",
            registering: "Registering...",
            alreadyHaveAccount: "Already have an account?",
            loginHere: "Login here",
        },
    },
});
