/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export const ApiConfig = {
	//[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="This is secret is for the public blob storage URL for retrieving locales which contains SAS (Secure Access Signature)")]
	CLLocaleEndpoint: "https://blisstorage.blob.core.windows.net/cultures/supportedCultures.json?sr=b&sv=2015-02-21&st=2017-11-14T22%3A27%3A03Z&se=2022-11-14T23%3A27%3A00Z&sp=r&sig=xrtnS5ZzW6TnZtQjp6dPCKnmExTGALnGcXIuO3GKaRE%3D",
}

export default ApiConfig