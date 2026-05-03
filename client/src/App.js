import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
    const [emails, setEmails] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [categoryStats, setCategoryStats] = useState({
        Personal: 0,
        Business: 0,
        Finance: 0,
        Security: 0,
        Work: 0,
        'College/School': 0,
        Promotion: 0
    });

    useEffect(() => {
        // Fetch existing emails
        const fetchInitialData = async () => {
            try {
                const response = await fetch(`${SOCKET_URL}/api/emails`);
                const result = await response.json();
                if (result.success) {
                    setEmails(result.data);
                }

                const statsResponse = await fetch(`${SOCKET_URL}/api/emails/stats`);
                const statsResult = await statsResponse.json();
                if (statsResult.success) {
                    setCategoryStats(statsResult.data.categories);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchInitialData();

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10
        });

        socket.on('connect', () => {
            console.log('Connected to LiveMail server');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from LiveMail server');
            setIsConnected(false);
        });

        // Listen for new categorized emails
        socket.on('new-email', (emailData) => {
            console.log('New email received:', emailData);

            setEmails(prev => [emailData, ...prev]);

            // Update category statistics
            setCategoryStats(prev => ({
                ...prev,
                [emailData.category]: prev[emailData.category] + 1
            }));
        });

        // Error handling
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Dashboard
                emails={emails}
                isConnected={isConnected}
                categoryStats={categoryStats}
            />
        </div>
    );
}

export default App;