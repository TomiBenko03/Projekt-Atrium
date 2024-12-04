import { useEffect, useContext } from 'react';
import { UserContext } from '../userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LogoutPage = () => {
    const userContext = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try{
                await axios.post('http://localhost:3001/api/agents/logout', {}, { withCredentials: true });
                console.log('Logged out successfully');
                userContext.setUserContext(null);
                navigate('/');
            } catch (error) {
                console.error('Error logging out: ', error);
            }
        };
        logout();
    }, [navigate, userContext]);
};

export default LogoutPage;