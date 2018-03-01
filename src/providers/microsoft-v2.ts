import { IProvider } from 'react-simple-auth'
import { generateGUID as guid } from '../util'

export interface IdToken {
    ver: string
    iss: string
    sub: string
    aud: string
    exp: number
    iat: number
    nbf: number
    name: string
    preferred_username: string
    oid: string
    tid: string
    at_hash: string
    nonce: string
    aio: string
}

export interface Session {
    accessToken: string
    expireDurationSeconds: number
    idToken: string
    decodedIdToken: IdToken
}

export const microsoftProvider: IProvider<Session> = {
    buildAuthorizeUrl() {
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=id_token+token
&scope=${encodeURIComponent('https://graph.microsoft.com/user.read openid profile email')}
&client_id=${process.env.REACT_APP_AAD_APP_ID}
&redirect_uri=${encodeURIComponent(`${window.location.origin}/redirect.html`)}
&state=${guid()}
&nonce=${guid()}
&client_info=1
&x-client-SKU=BLIS
&x-client-Ver=1.0.0
&client-request-id=${guid()}
&login_hint=
&domain_req=${guid()}
&login_req=${guid()}
&prompt=login`
    },

    extractError(redirectUrl: string): Error | undefined {
        const errorMatch = redirectUrl.match(/error=([^&]+)/)
        if (!errorMatch) {
            return undefined
        }

        const errorReason = decodeURIComponent(errorMatch[1])
        const errorDescriptionMatch = redirectUrl.match(/error_description=([^&]+)/)
        const errorDescription = errorDescriptionMatch ? decodeURIComponent(errorDescriptionMatch[1]).replace(/[+]/g, ' ') : 'Error could not be extracted from the url'
        return new Error(`Error during login. Reason: ${errorReason} Description: ${errorDescription}`)
    },

    extractSession(redirectUrl: string): Session {
        let accessToken: string = null!
        const accessTokenMatch = redirectUrl.match(/access_token=([^&]+)/)
        if (accessTokenMatch) {
            accessToken = accessTokenMatch[1]
        }

        let idToken: string = null!
        let decodedIdToken: IdToken = null!
        const idTokenMatch = redirectUrl.match(/id_token=([^&]+)/)
        if (idTokenMatch) {
            idToken = idTokenMatch[1]
            decodedIdToken = JSON.parse(atob(idToken.split('.')[1]))
        }

        let expireDurationSeconds: number = 3600
        const expireDurationSecondsMatch = redirectUrl.match(/expires_in=([^&]+)/)
        if (expireDurationSecondsMatch) {
            expireDurationSeconds = parseInt(expireDurationSecondsMatch[1])
        }

        return {
            accessToken,
            expireDurationSeconds,
            idToken,
            decodedIdToken
        }
    },

    validateSession(session: Session): boolean {
        const aadAppId = process.env.REACT_APP_AAD_APP_ID
        if (session.decodedIdToken.aud !== aadAppId) {
            console.warn(`Current application is expecting token issued for audience: ${aadAppId}; however, the current token's audience is: ${session.decodedIdToken.aud}`)
            return false
        }

        const now = (new Date()).getTime() / 1000

        // With normal JWT tokens you can inspect the `exp` Expiration claim; however,
        // AAD V2 tokens are opaque and we must use the token meta about expiration time
        // "When you request an access token from the v2.0 endpoint, the v2.0 endpoint also returns metadata about the access token for your app to use."
        // See: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-tokens
        // Here we are leveraging the fact that the access token was issued at the same
        // time as the ID token and can use its `iat` Issued At claim + the duration
        // to compute an absolute expiration time
        // const expiration = session.decodedIdToken.iat + session.expireDurationSeconds

        // Since we're using the ID token which is a JWT intead of opaque access tokens we can inspect the token
        const expiration = session.decodedIdToken.exp

        // Further validation could occur by using browser crypto
        // See: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-tokens#validating-tokens
        // https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration

        // 15 minutes minimum duration until token expires
        const minimumDuration = 60 * 15
        return (expiration - now) > minimumDuration
    },

    // TODO: This is kind of hack becuase we're asking for access token and returning id token
    // Also, for this to be scalable we would need to store access tokens in map keyed by their resource ID.
    // As is now we're only ever acquiring a single access token.
    getAccessToken(session: Session, resourceId: string): string {
        if (resourceId === 'https://graph.microsoft.com/v1.0') {
            return session.accessToken
        }

        return session.idToken
    },

    getSignOutUrl(redirectUrl: string): string {
        return `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`
    }
}