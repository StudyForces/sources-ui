const prod = {
    url: {
        KEYCLOAK_BASE_URL: process.env.REACT_APP_KEYCLOAK_BASE_URL ?? "https://keycloak.pkasila.net/auth",
        API_BASE_URL: process.env.REACT_APP_API_BASE_URL ?? '/api'
    }
}

const dev = {
    url: {
        KEYCLOAK_BASE_URL: process.env.REACT_APP_KEYCLOAK_BASE_URL ?? "https://keycloak.pkasila.net/auth",
        API_BASE_URL: process.env.REACT_APP_API_BASE_URL ?? 'https://sources-sf.pkasila.net/api'
    }
};

export const config = process.env.NODE_ENV === 'development' ? dev : prod
