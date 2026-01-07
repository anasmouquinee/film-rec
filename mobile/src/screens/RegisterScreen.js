import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const API_URL = API_BASE_URL;

    const handleRegister = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (data.success) {
                // Navigate to GenreSelection with userId
                navigation.navigate('GenreSelection', { userId: data.userId });
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('Network error');
        }
    };

    return (
        <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' }}
            style={styles.backgroundImage}
        >
            <LinearGradient
                colors={['rgba(5, 10, 24, 0.5)', 'rgba(5, 10, 24, 0.95)']}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    <Text style={styles.logo}>A-FILM</Text>

                    <View style={styles.form}>
                        <Text style={styles.header}>Create Account</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor="#8899A6"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#8899A6"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#8899A6"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleRegister}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.link}>Already have an account? <Text style={styles.signupText}>Sign in.</Text></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        alignItems: 'center',
    },
    logo: {
        fontSize: 50,
        fontWeight: 'bold',
        color: '#00C2FF',
        marginBottom: 40,
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 194, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    form: {
        width: '100%',
        backgroundColor: 'rgba(21, 31, 56, 0.7)',
        padding: 30,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        backgroundColor: 'rgba(5, 10, 24, 0.5)',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        color: 'white',
        borderWidth: 1,
        borderColor: '#2A3B55',
    },
    button: {
        backgroundColor: '#00C2FF',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#00C2FF",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: '#050A18',
        fontSize: 18,
        fontWeight: 'bold',
    },
    link: {
        color: '#8899A6',
        marginTop: 20,
        textAlign: 'center',
    },
    signupText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
