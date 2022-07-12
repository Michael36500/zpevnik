import Strapi from 'strapi-sdk-js';

export const strapi = new Strapi({
    url: process.env.REACT_APP_STRAPI_URL||"https://strapi.jradl.cz"
})