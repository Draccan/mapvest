import flattenObject from "../utils/flattenObject";

export default flattenObject({
    errors: {
        createMapCategory:
            "Errore durante la creazione della categoria. Si prega di riprovare più tardi.",
        createMapPoint:
            "Errore durante la creazione del punto sulla mappa. Si prega di riprovare più tardi.",
        deleteMapPoints:
            "Errore durante l'eliminazione dei punti sulla mappa. Si prega di riprovare più tardi.",
        getMapPoints:
            "Errore durante il caricamento dei punti sulla mappa. Si prega di riprovare più tardi.",
        getMapCategories:
            "Errore durante il caricamento delle categorie. Si prega di riprovare più tardi.",
        createUser:
            "Errore durante la creazione dell'account utente. Si prega di riprovare più tardi.",
        getCurrentUser:
            "Errore durante il caricamento delle informazioni utente. Si prega di riprovare più tardi.",
        getSearchAddresses:
            "Errore durante la ricerca degli indirizzi. Si prega di riprovare più tardi.",
        getGroupMaps:
            "Errore durante il caricamento delle mappe. Si prega di riprovare più tardi.",
        getUserGroups:
            "Errore durante il caricamento dei gruppi. Si prega di riprovare più tardi.",
        calculateOptimizedRoute:
            "Errore durante il calcolo del percorso ottimizzato. Si prega di riprovare più tardi.",
    },
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
            description: "Descrizione",
            date: "Data",
            category: "Categoria",
            selectCategory: "Seleziona una categoria",
            addNewCategory: "Aggiungi Nuova Categoria",
            noCategories: "Nessuna categoria disponibile",
            save: "Salva Punto",
            saving: "Salvataggio...",
            clickOnMapInstructions:
                "Clicca sulla mappa per selezionare le coordinate.",
        },
        CategoryModal: {
            title: "Crea Nuova Categoria",
            description: "Descrizione Categoria",
            color: "Colore",
            save: "Salva Categoria",
            saving: "Salvataggio...",
            cancel: "Annulla",
            descriptionRequired: "La descrizione è obbligatoria",
            colorRequired: "Il colore è obbligatorio",
        },
        RoutesWrapper: {
            restoringSession: "Ripristino della sessione in corso...",
        },
        ThemeToggle: {
            switchToDark: "Passa alla modalità scura",
            switchToLight: "Passa alla modalità chiara",
        },
    },
    views: {
        Home: {
            user: "Profilo",
            logout: "Esci",
            title: "La mia Mappa",
            enterAnalysisMode: "Analizza Area",
            exitAnalysisMode: "Esci dalla Modalità Analisi",
        },
        User: {
            title: "Profilo Utente",
            userInfo: "Informazioni Utente",
            name: "Nome",
            surname: "Cognome",
            email: "Email",
            changePassword: "Cambia Password",
            currentPassword: "Password Attuale",
            newPassword: "Nuova Password",
            confirmNewPassword: "Conferma Nuova Password",
            updatePassword: "Aggiorna Password",
            updating: "Aggiornamento...",
            backToMap: "Torna alla Mappa",
            passwordUpdatedSuccess: "Password aggiornata con successo",
            passwordsDoNotMatch: "Le password non corrispondono",
            incorrectCurrentPassword: "La password attuale non è corretta",
            passwordUpdateError:
                "Errore durante l'aggiornamento della password",
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
