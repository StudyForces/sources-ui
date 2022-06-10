const prod = {
    url: {
        KEYCLOAK_BASE_URL: "https://keycloak.pkasila.net/auth",
        API_BASE_URL: 'https://sources-sf.pkasila.net/api'
    }
}

const dev = prod;

export const config = process.env.NODE_ENV === 'development' ? dev : prod
