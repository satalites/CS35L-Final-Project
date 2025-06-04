// src/MusicPlayer.js
import React, { useRef, useState, useEffect } from 'react';
import '../styles/App.css'
import track from '../assets/menumusic.mp3'
import pauseIcon from '../assets/pause.png'
import playIcon from '../assets/play.png'
import keyPress from '../assets/key-press.mp3'

export const MusicPlayer = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch((err) => {
                        console.warn('Autoplay failed:', err);
                    });
            }
        }
    }, []);
    
    const clickAudioRef = useRef(new Audio(keyPress));

    const playClickSound = () => {
        clickAudioRef.current.currentTime = 0;
        clickAudioRef.current.volume = 1.0;
        clickAudioRef.current.play();
    };

    const handlePlayPause = () => {
        playClickSound(); 

        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume)
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };


    return (
        <div 
            className="MusicPlayer"
            style={{
                border: '1px solid #ccc',
                padding: '20px',
                width: 'fit-content',
                margin: '40px auto',
                backgroundColor: '#f9f9f9',
            }}
        >
            <audio ref={audioRef} src={track} autoPlay />
            <button onClick={handlePlayPause}>
                <img
                    src={isPlaying ? pauseIcon : playIcon}
                    alt={isPlaying ? 'Pause' : 'Play'}
                    style={{ width: '30px', height: '30px'}}
                />
            </button>

            <div>
                <label>vol: </label>
                <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    />
            </div>
        </div>
    );
};