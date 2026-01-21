const routes = {
    notFound: () => "*",
    home: () => "/",
    dashboard: () => "/dashboard",
    settings: () => "/settings",
    user: () => "/user",
    login: () => "/login",
    register: () => "/register",
    resetPassword: () => "/reset-password",
    publicMap: (mapId?: string) =>
        mapId ? `/public/map/${mapId}` : "/public/map/:mapId",
};

export default routes;
