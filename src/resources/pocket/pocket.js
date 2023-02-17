import PocketBase from 'pocketbase';

export const pocket = new PocketBase(
        process.env.REACT_APP_POCKET_URL||"https://pocket.jradl.cz"
    );
