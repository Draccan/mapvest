import { UserGroupRole } from "../core/commons/enums";
import flattenObject from "../utils/flattenObject";

export default flattenObject({
    errors: {
        createMapCategory:
            "Errore durante la creazione della categoria. Si prega di riprovare più tardi.",
        createMapPoint:
            "Errore durante la creazione del punto sulla mappa. Si prega di riprovare più tardi.",
        updateMapPoint:
            "Errore durante l'aggiornamento del punto sulla mappa. Si prega di riprovare più tardi.",
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
        getGroupUsers:
            "Errore durante il caricamento degli utenti del gruppo. Si prega di riprovare più tardi.",
        calculateOptimizedRoute:
            "Errore durante il calcolo del percorso ottimizzato. Si prega di riprovare più tardi.",
        resetPassword:
            "Errore durante l'invio del link di reset password. Si prega di riprovare più tardi.",
        updateUserPassword:
            "Errore durante l'aggiornamento della password. Si prega di riprovare più tardi.",
        updateGroup:
            "Errore durante l'aggiornamento del gruppo. Si prega di riprovare più tardi.",
        updateMap:
            "Errore durante l'aggiornamento della mappa. Si prega di riprovare più tardi.",
        createMap:
            "Errore durante la creazione della mappa. Si prega di riprovare più tardi.",
        addUsersToGroup:
            "Errore durante l'aggiunta dell'utente al gruppo. Si prega di riprovare più tardi.",
        removeUserFromGroup:
            "Errore durante la rimozione dell'utente dal gruppo. Si prega di riprovare più tardi.",
        updateUserInGroup:
            "Errore durante l'aggiornamento del ruolo utente. Si prega di riprovare più tardi.",
        getPublicMap:
            "Errore durante il caricamento della mappa pubblica. Si prega di riprovare più tardi.",
        getPublicMapPoints:
            "Errore durante il caricamento dei punti della mappa pubblica. Si prega di riprovare più tardi.",
        getPublicMapCategories:
            "Errore durante il caricamento delle categorie della mappa pubblica. Si prega di riprovare più tardi.",
        deleteMap:
            "Errore durante l'eliminazione della mappa. Si prega di riprovare più tardi.",
        deleteMapCategory:
            "Errore durante l'eliminazione della categoria. Si prega di riprovare più tardi.",
        updateMapCategory:
            "Errore durante l'aggiornamento della categoria. Si prega di riprovare più tardi.",
        importMapPoints:
            "Errore durante l'importazione dei punti. Si prega di riprovare più tardi.",
    },
    messages: {
        userAddedSuccessfully: "Utente aggiunto con successo",
        userRemovedSuccessfully: "Utente rimosso con successo",
        userRoleUpdatedSuccessfully: "Ruolo utente aggiornato con successo",
        mapDeletedSuccessfully: "Mappa eliminata con successo",
        categoryDeletedSuccessfully: "Categoria eliminata con successo",
        categoryUpdatedSuccessfully: "Categoria aggiornata con successo",
        importingMapPoints: "Importazione punti in corso...",
        importMapPointsSuccess: "{count} punti importati con successo",
        importMapPointsPartialSuccess:
            "{successCount} punti importati, {errorCount} errori",
        importMapPointsAllFailed:
            "Importazione fallita. Nessun punto è stato importato.",
    },
    components: {
        Breadcrumb: {
            selectGroup: "Seleziona Gruppo",
            selectMap: "Seleziona Mappa",
            renameGroup: "Rinomina Gruppo",
            renameMap: "Rinomina Mappa",
            addMap: "Aggiungi Mappa",
            deleteMap: "Elimina Mappa",
            newMapPlaceholder: "Inserisci nome mappa...",
            noMapSelected: "Nessuna mappa selezionata",
            noMaps: "Nessuna mappa",
            noMapsAvailable: "Nessuna mappa disponibile. Creane una nuova.",
            save: "Salva",
            cancel: "Annulla",
            deleteMapModal: {
                title: "Elimina Mappa",
                message:
                    "Sei sicuro di voler eliminare la mappa {mapName}? Una volta cancellata perderai tutti i dati relativi a questa mappa.",
                confirm: "Elimina",
                cancel: "Annulla",
            },
        },
        FileDropzone: {
            dropzoneText: "Trascina il tuo file qui, oppure",
            selectFile: "Seleziona File",
        },
        LoggedRouteWrapper: {
            loadingData: "Caricamento dati...",
        },
        NavigationBar: {
            home: "Home",
            dashboard: "Dashboard",
            settings: "Impostazioni",
            user: "Profilo",
            logout: "Esci",
        },
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
            tooManyPointsForRoute:
                "Hai selezionato {current} punti. Per calcolare un percorso, seleziona al massimo {max} punti.",
            viewRouteDetails: "Vedi Dettagli Percorso",
        },
        CategoryChart: {
            pointsByCategory: "Punti per Categoria",
            noData: "Nessun dato disponibile",
            noCategory: "Senza Categoria",
            count: "Numero",
        },
        DashboardHeatmap: {
            heatmap: "Mappa di Densità Geografica",
            noData: "Nessun dato disponibile",
        },
        KpiCards: {
            totalPoints: "Punti Totali",
            pendingPoints: "Non in ritardo",
            overduePoints: "In Ritardo",
            noDeadlinePoints: "Senza Scadenza",
        },
        TimelineChart: {
            pointsByDueDate: "Punti per Data di Scadenza",
            overdue: "In Ritardo",
        },
        RouteDetailsModal: {
            title: "Dettagli Percorso",
            totalDistance: "Distanza Totale",
            totalDuration: "Durata Totale",
            totalStops: "Tappe Totali",
            noDescription: "Nessuna descrizione",
        },
        MapContainer: {
            description: "Descrizione",
            date: "Data",
            dueDate: "Data di Scadenza",
            coordinates: "Coordinate",
            selectedPoint: "Punto Selezionato",
            deletePoint: "Elimina Punto",
            editPoint: "Modifica Punto",
            startPoint: "Punto di Partenza",
            endPoint: "Punto di Arrivo",
            stop: "Tappa",
        },
        UserLocationMarker: {
            userLocation: "La Tua Posizione",
        },
        MapPointForm: {
            addMapPoint: "Aggiungi Punto Mappa",
            description: "Descrizione",
            date: "Data",
            dueDate: "Data di Scadenza",
            addDueDate: "Aggiungi Data di Scadenza",
            notes: "Note",
            addOtherFields: "Aggiungi Altri Dati",
            category: "Categoria",
            selectCategory: "Seleziona una categoria",
            addNewCategory: "Aggiungi Nuova Categoria",
            noCategories: "Nessuna categoria disponibile",
            deleteCategory: "Elimina categoria",
            editCategory: "Modifica categoria",
            save: "Salva Punto",
            update: "Modifica Punto",
            saving: "Salvataggio...",
            updating: "Aggiornamento...",
            clickOnMapInstructions:
                "Clicca sulla mappa per selezionare le coordinate.",
        },
        CategoryModal: {
            title: "Crea Nuova Categoria",
            titleEdit: "Modifica Categoria",
            editMessage:
                "La modifica di questa categoria influenzerà tutti i punti su questa mappa.",
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
        DeleteCategoryModal: {
            title: "Elimina Categoria",
            message:
                "Sei sicuro di voler eliminare questa categoria? La categoria verrà rimossa da tutti i punti su questa mappa.",
            confirm: "Elimina",
            cancel: "Annulla",
        },
        ImportMapPointsModal: {
            title: "Carica Punti da File",
            description:
                "Carica un file Excel o CSV per importare più punti contemporaneamente. Il file deve avere le colonne elencate di seguito.",
            columnsTitle: "Colonne richieste:",
            columnDescription: "description",
            columnLatitude: "latitude",
            columnLongitude: "longitude",
            columnDate: "date",
            columnDueDate: "dueDate",
            columnNotes: "notes",
            columnCategory: "category",
            columnRequired: "obbligatorio",
            columnOptional: "opzionale",
            columnDateHint: "opzionale, default oggi",
            columnCategoryHint: "opzionale, nome categoria",
            maxRowsWarning: "Massimo {max} righe per file",
            dropzoneText: "Trascina il tuo file qui, oppure",
            selectFile: "Seleziona File",
            cancel: "Annulla",
            import: "Importa",
            importing: "Importazione...",
            invalidFileType:
                "Tipo di file non valido. Tipi consentiti: {types}",
            successCount: "{count} punti importati",
            errorCount: "{count} errori",
            errorsTitle: "Errori:",
            row: "Riga {row}:",
            close: "Chiudi",
        },

        SupportBox: {
            contactSupport: "Contatta il Supporto",
            emailSubject: "Richiesta supporto - MapVest",
            emailBody:
                "Descrivi il problema indicando il tuo indirizzo email utilizzato per accedere...",
        },
        ThemeToggle: {
            switchToDark: "Passa alla modalità scura",
            switchToLight: "Passa alla modalità chiara",
        },
        Settings: {
            UserTable: {
                name: "Nome",
                surname: "Cognome",
                email: "Email",
                role: "Ruolo",
                actions: "Azioni",
                removeUser: "Rimuovi utente",
                cannotRemoveSelf: "Non puoi rimuovere te stesso",
                cannotRemoveLastOwner:
                    "Non è possibile rimuovere l'unico proprietario",
                contributorsCannotRemove:
                    "I collaboratori non possono rimuovere utenti",
                noUsers: "Nessun utente trovato",
                roles: {
                    [UserGroupRole.Owner]: "Proprietario",
                    [UserGroupRole.Admin]: "Amministratore",
                    [UserGroupRole.Contributor]: "Collaboratore",
                },
            },
        },
    },
    views: {
        Home: {
            user: "Profilo",
            dashboard: "Dashboard",
            logout: "Esci",
            title: "La mia Mappa",
            enterAnalysisMode: "Analizza Area",
            exitAnalysisMode: "Esci dalla Modalità Analisi",
            publicMapToggle: "Mappa pubblica",
            copyPublicLink: "Copia link pubblico",
            linkCopied: "Link copiato negli appunti!",
            importPoints: "Carica punti da file",
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
            backToDashboard: "Torna alla Dashboard",
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
            forgotPassword: "Password dimenticata?",
            resetPasswordTitle: "Recupera Password",
            resetPasswordDescription:
                "Inserisci il tuo indirizzo email e ti invieremo un link per reimpostare la password.",
            sendResetLink: "Invia Link",
            sending: "Invio in corso...",
            cancel: "Annulla",
            resetPasswordSuccess:
                "Link di recupero inviato! Controlla la tua email.",
            passwordResetSuccessToast:
                "Password reimpostata con successo! Ora puoi accedere con la tua nuova password.",
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
        ResetPassword: {
            title: "Reimposta la Tua Password",
            description: "Inserisci la tua nuova password qui sotto.",
            passwordLabel: "Nuova Password:",
            confirmPasswordLabel: "Conferma Nuova Password:",
            resetPassword: "Reimposta Password",
            resetting: "Reimpostazione in corso...",
            passwordsDoNotMatch: "Le password non corrispondono",
        },
        Dashboard: {
            title: "Dashboard",
            home: "Home",
            dashboard: "Dashboard",
            user: "Profilo",
            logout: "Esci",
            backToHome: "Torna alla Home",
            noMap: "Nessuna mappa disponibile",
            noData: "Nessun dato disponibile",
            total: "Totale",
        },
        Settings: {
            title: "Impostazioni",
            group: "Gruppo:",
            addUser: "Aggiungi Utente",
            addUserModal: {
                title: "Aggiungi Utente al Gruppo",
                emailLabel: "Email Utente",
                add: "Aggiungi",
                cancel: "Annulla",
                invalidEmail: "Inserisci un indirizzo email valido",
            },
        },
        PublicMap: {
            mapNotFound: "Mappa pubblica non trovata o non più disponibile.",
        },
    },
});
