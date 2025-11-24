import flattenObject from "../utils/flattenObject";

export default flattenObject({
    components: {
        AreaAnalysis: {
            title: "Analisi Area",
            summary: "Riepilogo",
            totalPoints: "Punti Totali",
            recentPoints: "Punti Recenti",
            morePoints: "+ {count} altri punti",
            noPoints:
                "Nessun punto nell'area selezionata. Disegna un'area sulla mappa per analizzarla.",
            routePlanning: "Pianificazione Percorso",
            startPoint: "Punto di Partenza",
            endPoint: "Punto di Arrivo",
            selectPoint: "Seleziona un punto",
            calculateOptimizedRoute: "Calcola Percorso Ottimizzato",
        },
        MapContainer: {
            description: "Descrizione",
            date: "Data",
            coordinates: "Coordinate",
            selectedPoint: "Punto Selezionato",
            deletePoint: "Elimina Punto",
            startPoint: "Punto di Partenza",
            endPoint: "Punto di Arrivo",
            stop: "Tappa",
        },
        MapPointForm: {
            addMapPoint: "Aggiungi Punto Mappa",
            XCoordinateLabel: "Coordinata X (Longitudine)",
            YCoordinateLabel: "Coordinata Y (Latitudine)",
            description: "Descrizione",
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
        ThemeToggle: {
            switchToDark: "Passa alla modalità scura",
            switchToLight: "Passa alla modalità chiara",
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
            title: "La mia Mappa",
            enterAnalysisMode: "Analizza Area",
            exitAnalysisMode: "Esci dalla Modalità Analisi",
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
            title: "Oops! Ti sei perso!",
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
