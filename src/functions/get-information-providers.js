import logger from "../lib/logger/logger.js";


export async function getInformationProviders(numberKey) {
    try {
        const response = await fetch(`https://apigw.kmsp-store.com/sidompul/v4/cek_kuota?msisdn=${numberKey}&isJSON=true`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic c2lkb21wdWxhcGk6YXBpZ3drbXNw',
                'X-API-Key': '60ef29aa-a648-4668-90ae-20951ef90c55',
                'X-App-Version': '4.0.0'
            },
            rejectUnauthorized: false
        })
        if (!response.ok) logger.error(`Failed to fetch information providers: ${response.status} ${response.statusText}`);
        return await response.json();
    } catch (error) {
        logger.error(`Error fetching information providers: ${error.message}`);
        throw error;
    }
}

