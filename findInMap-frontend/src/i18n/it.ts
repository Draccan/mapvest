import flattenObject from "../utils/flattenObject";

export default flattenObject({
    components: {
        MapContainer: {
            type: "Tipo",
            types: {
                THEFT: "Furto",
                AGGRESSION: "Aggressione",
                ROBBERY: "Rapina",
            },
            date: "Data",
            coordinates: "Coordinate",
            selectedPoint: "Punto Selezionato",
        },
        MapPointForm: {
            addMapPoint: "Aggiungi Punto Mappa",
            XCoordinateLabel: "Coordinata X (Longitudine)",
            YCoordinateLabel: "Coordinata Y (Latitudine)",
            type: "Tipo",
            date: "Data",
            options: {
                theft: "Furto",
                aggression: "Aggressione",
                robbery: "Rapina",
            },
            save: "Salva Punto",
            saving: "Salvataggio...",
            clickOnMapInstructions:
                "Clicca sulla mappa per selezionare le coordinate.",
        },
    },
    views: {
        About: {
            description: "Senior Software Engineer Freelance",
            viewLinkedIn: "Visualizza il mio profilo LinkedIn",
            backToMap: "Torna alla Mappa",
        },
        Home: {
            about: "Chi sono",
            logout: "Esci",
            loadingMapPoints: "Caricamento punti mappa...",
        },
        Login: {
            emailLabel: "Email:",
            passwordLabel: "Password:",
            login: "Accedi",
            loading: "Accesso in corso...",
            noAccount: "Non hai un account?",
            registerHere: "Registrati qui",
        },
        NotFound: {
            title: "Oops! Sei perso!",
            description: "Sembra che tu abbia preso una direzione sbagliata.",
            description2: "Questo luogo non è ancora stato mappato!",
            backToMap: "Torna alla Mappa",
            footerMessage:
                "Non preoccuparti, anche i migliori esploratori a volte si perdono!",
        },
        Register: {
            passwordsDoNotMatch: "Le password non corrispondono",
            nameLabel: "Nome:",
            surnameLabel: "Cognome:",
            emailLabel: "Email:",
            passwordLabel: "Password:",
            confirmPasswordLabel: "Conferma Password:",
            register: "Registrati",
            registering: "Registrazione in corso...",
            alreadyHaveAccount: "Hai già un account?",
            loginHere: "Accedi qui",
        },
    },
});
