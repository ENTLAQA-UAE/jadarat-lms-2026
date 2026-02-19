
export const getToken = (hashedTokens: string) => {

    const refreshToken = hashedTokens.substring(
        hashedTokens.indexOf("refresh_token=") + 14,
        hashedTokens.indexOf("&token_type")
    );

    const accessToken = hashedTokens.substring(
        hashedTokens.indexOf("access_token=") + 13,
        hashedTokens.indexOf("&expires_at")
    );

    return {
        refreshToken,
        accessToken
    }

};