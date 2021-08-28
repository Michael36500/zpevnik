import Strapi from 'strapi-sdk';

export const strapi = new Strapi(process.env.REACT_APP_STRAPI_URL||"https://strapi.jradl.cz")