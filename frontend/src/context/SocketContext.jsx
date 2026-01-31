import { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { useUser } from './UserContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            // Adjust URL if needed, assuming generic relative or localhost
            const newSocket = io('http://localhost:3000');

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                newSocket.emit('join_room', user._id);
            });

            newSocket.on('new_notification', (notification) => {
                // Play sound if desired
                toast(notification.message || 'New Notification', {
                    icon: '🔔',
                    duration: 4000,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
