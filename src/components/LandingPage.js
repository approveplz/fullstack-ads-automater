import { useEffect, useContext } from 'react';
import { UserContext } from '../UserContext.js';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (currentUser) {
    //         navigate('home');
    //     }
    // }, [currentUser, navigate]);

    return (
        <div>
            Et ex enim laboris proident nisi tempor exercitation fugiat
            adipisicing excepteur consequat elit officia eiusmod. Cillum
            reprehenderit et esse aliqua consequat irure proident voluptate
            eiusmod. Dolore cillum tempor ut adipisicing sit ad eiusmod quis
            duis ipsum aute aute do dolor. Nisi nisi in ut nostrud enim ad eu.
            Sit deserunt ullamco id ullamco nulla proident eiusmod ipsum ad
            voluptate laborum veniam laboris in. Minim eu elit do et.
            Adipisicing veniam veniam do minim nostrud fugiat veniam fugiat sit
            veniam velit cillum laboris culpa. Commodo mollit magna duis aute
            nisi quis sit ullamco laborum. Enim non esse laborum aute quis
            adipisicing est amet do id adipisicing exercitation. Do velit amet
            adipisicing exercitation cillum exercitation sit sint id ipsum
            excepteur reprehenderit id elit. Voluptate pariatur voluptate anim
            ut irure. Anim Lorem anim nisi exercitation nulla voluptate nostrud
            id occaecat officia fugiat est excepteur nulla. Ut ipsum esse
            aliquip duis elit duis quis laboris quis ut. Laborum fugiat duis
            minim cillum. Sit in anim esse ad duis occaecat incididunt tempor
            eiusmod irure veniam in anim. Velit veniam consequat sint nostrud
            proident et pariatur. Culpa ullamco ex elit duis laborum culpa
            veniam do do ullamco ipsum magna officia officia. Minim aliquip
            cupidatat minim esse id irure aute nisi. Minim Lorem sunt nisi
            labore ipsum Lorem veniam ad reprehenderit duis ea. Nisi fugiat id
            occaecat reprehenderit id incididunt sint excepteur magna ullamco
            cillum nostrud anim laboris. Nisi nulla ipsum voluptate laborum et
            consequat anim. Duis ex laborum officia ipsum anim dolore
            reprehenderit ex sunt commodo officia proident nisi. Adipisicing
            irure nulla officia mollit laborum ullamco aliqua esse adipisicing
            ullamco exercitation non. Nulla occaecat occaecat ipsum cillum
            ullamco Lorem nostrud velit sunt. Ad tempor duis eu non qui deserunt
            Lorem occaecat elit eu dolor. Lorem in ullamco cupidatat occaecat
            consectetur sunt cillum incididunt dolor exercitation ullamco nisi.
            Id eiusmod id dolore magna excepteur esse laboris.
        </div>
    );
}

export default LandingPage;
