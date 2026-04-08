const routes = {
    notFound: () => "*",
    home: () => "/",
    dashboard: () => "/dashboard",
    settings: () => "/settings",
    user: () => "/user",
    login: () => "/login",
    register: () => "/register",
    resetPassword: () => "/reset-password",
    paymentSuccess: () => "/payment/success",
    paymentCancelled: () => "/payment/cancelled",
    publicMap: (mapId?: string) =>
        mapId ? `/public/map/${mapId}` : "/public/map/:mapId",
};

export default routes;
