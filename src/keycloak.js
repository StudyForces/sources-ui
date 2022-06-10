import Keycloak from 'keycloak-js'
import {config} from "./Constants";

const keycloak = new Keycloak({
    url: config.url.KEYCLOAK_BASE_URL,
    realm: "StudyForces",
    clientId: "sources-ui"
})

export default keycloak
