import Keycloak from 'keycloak-js'
import {config} from "./Constants";

const keycloak = new Keycloak({
    url: config.url.KEYCLOAK_BASE_URL,
    realm: "StudyForces",
    clientId: "sources-ui"
})


if (process.env.NODE_ENV === 'development') {
    window.keycloak = keycloak;
}

export default keycloak
