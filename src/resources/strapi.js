import Strapi from 'strapi-sdk';

export const strapi = new Strapi(process.env.REACT_APP_STRAPI_URL||"http://localhost:1337")