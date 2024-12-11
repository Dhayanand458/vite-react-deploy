import { useRef, useEffect, useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { VideoTexture } from 'three';
import * as THREE from 'three';
import { SUN_RADIUS } from '../config/constants';
import { useCamera } from '../context/Camera';
import { Html } from '@react-three/drei';
import checkButtonImage from '../context/check-button.png'; // First image
import checkImage from '../context/check.png'; // Second image

const youtubeURL = 'https://hilarious-medovik-91975a.netlify.app/';
const redirectURL = 'https://hilarious-medovik-91975a.netlify.app/';

const Sun = () => {
    const { handleFocus } = useCamera();
    const planeRef = useRef(null);
    const [showButtons, setShowButtons] = useState(false);
    const [videoSrc, setVideoSrc] = useState('');
    const [isPlayingMaking, setIsPlayingMaking] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [rotationComplete, setRotationComplete] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const videoElementRef = useRef(null);

    const [hasRestarted, setHasRestarted] = useState(false); // State to track if video has restarted

    // Load video source based on URL parameters (first mount only)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const videoName = urlParams.get('song') || 'song1';
        setVideoSrc(`/videos/${videoName}.mp4`);
    }, []);

    // Load and set up video when `videoSrc` changes
    useEffect(() => {
        if (!videoSrc) return;

        const video = document.createElement('video');
        video.src = videoSrc;
        video.muted = isMuted;
        video.playsInline = true;
        video.autoplay = true;
        video.preload = 'metadata';

        video.addEventListener('loadeddata', () => {
            setVideoLoaded(true);
            videoElementRef.current = video;

            video.play()
                .then(() => {
                    const videoTexture = new VideoTexture(video);
                    videoTexture.minFilter = THREE.NearestFilter;
                    videoTexture.magFilter = THREE.NearestFilter;

                    if (planeRef.current) {
                        planeRef.current.material.map = videoTexture;
                        planeRef.current.material.needsUpdate = true;
                    }

                    animateRotation(); // Start rotation after video loads
                })
                .catch((err) => {
                    console.error('Error during video play:', err);
                });
        });

        video.addEventListener('ended', () => {
            if (!isPlayingMaking) {
                setShowButtons(true);
            } else {
                window.location.href = redirectURL;
            }
        });

        video.addEventListener('error', (err) => {
            console.error('Error loading the video:', err);
        });

        return () => {
            video.pause();
            video.removeAttribute('src');
            video.load();
        };
    }, [videoSrc, isPlayingMaking, isMuted]);

    // Rotation animation: 360 degrees, then an additional 40 degrees, then stops
    const animateRotation = () => {
        let currentRotation = 0;
        const firstRotation = THREE.MathUtils.degToRad(360);
        const secondRotation = THREE.MathUtils.degToRad(60);

        const rotate = () => {
            if (planeRef.current && currentRotation < firstRotation + secondRotation) {
                const rotationStep = 5 * (Math.PI / 180);
                planeRef.current.rotation.y += rotationStep;
                currentRotation += rotationStep;

                if (currentRotation >= firstRotation + secondRotation) {
                    planeRef.current.rotation.y = THREE.MathUtils.degToRad(60);
                    setRotationComplete(true);
                    return;
                }
                requestAnimationFrame(rotate);
            }
        };

        if (!rotationComplete) rotate();
    };

    // Function to handle rotation on click
    const handleRotate = (direction) => {
        if (planeRef.current) {
            const rotationStep = THREE.MathUtils.degToRad(20); // Adjust the rotation step as needed
            planeRef.current.rotation.y += direction === 'right' ? rotationStep : -rotationStep;
        }
    };

    const handleIconClick = (direction) => {
        if (!hasRestarted && videoLoaded && videoElementRef.current) {
            // Restart video only on the first click
            setIsMuted(false);
            videoElementRef.current.currentTime = 0; // Reset video to start
            videoElementRef.current.muted = false;
    
            // Play video from the start
            videoElementRef.current.play().catch((err) => {
                console.error('Error playing video on interaction:', err);
            });
    
            // Rotate immediately after restart
            handleRotate(direction);
    
            // Set flag to indicate the video has been restarted
            setHasRestarted(true);
        } else {
            // Rotate the video on subsequent clicks
            handleRotate(direction);
        }
    };
    
    // Redirect to YouTube on button click
    const handleYoutubeRedirect = () => {
        window.location.href = youtubeURL;
    };

    // Play the "making" video on button click
    const handleMakingVideoPlay = () => {
        const baseVideoName = videoSrc.replace('.mp4', '');
        const newVideoSrc = `${baseVideoName}-making.mp4`;

        setVideoSrc(newVideoSrc);
        setIsPlayingMaking(true);
        setShowButtons(false);
    };

    return (
        <RigidBody
            colliders='ball'
            userData={{ type: 'Sun' }}
            type='kinematicPosition'
            onClick={handleFocus}
        >
            <mesh ref={planeRef}>
                <planeGeometry args={[SUN_RADIUS * 2 * (9 / 16), SUN_RADIUS * 2]} />
                <meshBasicMaterial transparent={true} side={THREE.DoubleSide} />
            </mesh>

            <pointLight position={[0, 0, 0]} intensity={50000} color={'rgb(255, 207, 55)'} />

            {/* First Icon Button */}
            <Html position={[15, 4, 0]} style={{ transform: 'translate(-50%, -50%)', pointerEvents: 'auto' }}>
                <img
                    src={checkButtonImage}
                    alt="Restart and Rotate Right"
                    onClick={() => handleIconClick('right')}
                    style={{
                        cursor: 'pointer',
                        width: '50px', // Adjust the size as needed
                        height: '50px', // Adjust the size as needed
                        position: 'absolute'
                    }}
                />
            </Html>

            {/* Second Icon Button - Slightly to the left */}
            <Html position={[-20, 4, 0]} style={{ transform: 'translate(-50%, -50%)', pointerEvents: 'auto' }}>
                <img
                    src={checkImage}
                    alt="Rotate Left"
                    onClick={() => handleIconClick('left')}
                    style={{
                        cursor: 'pointer',
                        width: '50px', // Adjust the size as needed
                        height: '50px', // Adjust the size as needed
                        position: 'absolute'
                    }}
                />
            </Html>
            {showButtons && (
    <>
        <Html position={[-SUN_RADIUS * 1.2, SUN_RADIUS * 1.4, 0]} transform occlude>
            <button
                onClick={handleYoutubeRedirect}
                style={{
                    position: 'absolute',
                    backgroundColor: '#007bff', // professional blue color
                    color: 'white',
                    padding: '15px 60px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '60px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // shadow for depth
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} // darker blue on hover
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
                Download Folder
            </button>
        </Html>

        <Html position={[SUN_RADIUS * 0.5, -SUN_RADIUS * 1.2, 0]} transform occlude>
            <button
                onClick={handleMakingVideoPlay}
                style={{
                    position: 'absolute',
                    backgroundColor: '#28a745', // professional green color
                    color: 'white',
                    padding: '15px 60px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '70px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // shadow for depth
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'} // darker green on hover
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
            >
                Continue
            </button>
        </Html>
    </>
            )}
        </RigidBody>
    );
};

export default Sun;
