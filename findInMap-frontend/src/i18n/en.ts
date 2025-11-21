import flattenObject from "../utils/flattenObject";

export default flattenObject({
    components: {
        AreaAnalysis: {
            title: "Area Analysis",
            summary: "Summary",
            totalPoints: "Total Points",
            byType: "By Type",
            recentPoints: "Recent Points",
            morePoints: "+ {count} more points",
            noPoints:
                "No points in the selected area. Draw an area on the map to analyze.",
            routePlanning: "Route Planning",
            startPoint: "Start Point",
            endPoint: "End Point",
            selectPoint: "Select a point",
            calculateOptimizedRoute: "Calculate Optimized Route",
        },
        MapContainer: {
            type: "Type",
            date: "Date",
            coordinates: "Coordinates",
            selectedPoint: "Selected Point",
            deletePoint: "Delete Point",
            startPoint: "Start Point",
            endPoint: "End Point",
            stop: "Stop",
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
        ThemeToggle: {
            switchToDark: "Switch to dark mode",
            switchToLight: "Switch to light mode",
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
            enterAnalysisMode: "Analyze Area",
            exitAnalysisMode: "Exit Analysis Mode",
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
