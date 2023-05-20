import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.config';

interface IUser {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    scene: 'todayMatches' | 'tournaments' | 'standings' | 'league stats'
}

interface IUserDb extends IUser {
    date: string;
}

async function getUsers(): Promise<IUserDb[] | undefined> {
    const usersRef = doc(db, 'users', 'list');
    try {
        const response = (await getDoc(usersRef)).data() as { footballStats: IUserDb[] };
        return response.footballStats;
    } catch (error) {
        console.log(error, 'GET USERS FAILED');
    }
}

async function saveUser(oldUsers: IUserDb[], newUser: IUserDb) {
    const usersRef = doc(db, 'users', 'list');
    try {
        await updateDoc(usersRef, {
            footballStats: [...oldUsers, JSON.parse(JSON.stringify(newUser)) ]
        });
        console.log('USER SAVED SUCCESSFULLY');

    } catch (error) {
        console.log(error, 'SAVING USER FAILED');
    }
}

export async function startInteraction(user: IUser) {
    const newUser: IUserDb = {
        ...user,
        date: new Date().toLocaleString(),
    };

    try {
        const oldUsers = await getUsers();
        if(oldUsers) await saveUser(oldUsers, newUser);
    } catch (error) {
        console.log(error, 'USER START INTERACTION ERROR');
    }

}
